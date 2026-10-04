import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

function executeQuery(sql) {
    const escapedSql = sql.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const cmd = `npx supabase db query --linked --output json "${escapedSql}"`;
    try {
        const stdout = execSync(cmd, { stdio: 'pipe', encoding: 'utf-8', maxBuffer: 1024 * 1024 * 50 });
        const firstBrace = stdout.indexOf('{');
        const lastBrace = stdout.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error("Could not find JSON in output:\n" + stdout.substring(0, 500));
        }
        const jsonStr = stdout.substring(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(jsonStr);
        return parsed.rows || [];
    } catch (err) {
        console.error("Query failed: " + sql);
        console.error(err.message);
        throw err;
    }
}

function getMigrationHistory() {
    try {
        const stdout = execSync('npx supabase migration list --linked', { encoding: 'utf-8' });
        const lines = stdout.split('\n');
        const history = [];
        let parseStarted = false;
        
        for (const line of lines) {
            if (line.includes('|')) {
                if (line.includes('Local') && line.includes('Remote')) {
                    parseStarted = true;
                    continue;
                }
                if (parseStarted) {
                    const parts = line.split('|').map(p => p.replace(/`/g, '').trim());
                    if (parts.length >= 3) {
                        history.push({
                            local: parts[0] || null,
                            remote: parts[1] || null,
                            time: parts[2] || null
                        });
                    }
                }
            }
        }
        return history;
    } catch (err) {
        console.error("Migration list failed");
        return [];
    }
}

async function main() {
    console.log("Starting extraction...");
    
    const catalog = {
        metadata: {
            timestamp: new Date().toISOString(),
            cli_version: '2.119.0', // assuming from previous tests
            schemas_inspected: [],
            status: "SUCCESS"
        }
    };
    
    const queries = {
        schemas: `
            SELECT nspname AS schema_name
            FROM pg_namespace
            WHERE nspname NOT LIKE 'pg_temp_%'
              AND nspname NOT LIKE 'pg_toast_temp_%'
              AND nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_graphql', 'pg_sodium', 'graphql', 'graphql_public', 'pgbouncer', 'realtime', 'vault', 'supavisor', 'supabase_migrations')
            ORDER BY nspname
        `,
        extensions: `
            SELECT extname AS name, extversion AS version, n.nspname AS schema
            FROM pg_extension e
            JOIN pg_namespace n ON e.extnamespace = n.oid
            ORDER BY schema, name
        `,
        types: `
            SELECT n.nspname AS schema, t.typname AS name, t.typtype, 
                   c.relkind, obj_description(t.oid, 'pg_type') AS comment
            FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            LEFT JOIN pg_class c ON t.typrelid = c.oid
            WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
              AND t.typtype IN ('e', 'd', 'c', 'r')
            ORDER BY schema, name
        `,
        sequences: `
            SELECT n.nspname AS schema, c.relname AS name, 
                   pg_get_userbyid(c.relowner) AS owner,
                   t.typname AS data_type,
                   s.seqstart AS start, s.seqmin AS min, s.seqmax AS max,
                   s.seqincrement AS increment, s.seqcycle AS cycle, s.seqcache AS cache
            FROM pg_sequence s
            JOIN pg_class c ON s.seqrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            JOIN pg_type t ON s.seqtypid = t.oid
            WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
            ORDER BY schema, name
        `,
        tables: `
            SELECT n.nspname AS schema, c.relname AS name, c.oid, c.relkind,
                   c.relpersistence AS persistence, pg_get_userbyid(c.relowner) AS owner,
                   c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced,
                   c.relreplident AS replica_identity,
                   obj_description(c.oid, 'pg_class') AS comment
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE c.relkind IN ('r', 'p')
              AND n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
            ORDER BY schema, name
        `,
        columns: `
            SELECT n.nspname AS schema, c.relname AS table_name, a.attname AS column_name,
                   a.attnum AS ordinal, format_type(a.atttypid, a.atttypmod) AS formatted_data_type,
                   t.typname AS data_type,
                   NOT a.attnotnull AS nullable,
                   pg_get_expr(ad.adbin, ad.adrelid) AS default_value,
                   a.attidentity AS identity, a.attgenerated AS generated,
                   coll.collname AS collation,
                   col_description(c.oid, a.attnum) AS comment
            FROM pg_attribute a
            JOIN pg_class c ON a.attrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            JOIN pg_type t ON a.atttypid = t.oid
            LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
            LEFT JOIN pg_collation coll ON a.attcollation = coll.oid AND coll.collname != 'default'
            WHERE a.attnum > 0 AND NOT a.attisdropped
              AND c.relkind IN ('r', 'p', 'v', 'm')
              AND n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
            ORDER BY schema, table_name, ordinal
        `,
        constraints: `
            SELECT n.nspname AS schema, c.relname AS table_name, 
                   con.conname AS constraint_name, con.contype AS type,
                   pg_get_constraintdef(con.oid) AS definition,
                   obj_description(con.oid, 'pg_constraint') AS comment
            FROM pg_constraint con
            JOIN pg_class c ON con.conrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
            ORDER BY schema, table_name, constraint_name
        `,
        indexes: `
            SELECT n.nspname AS schema, c.relname AS table_name,
                   i.relname AS index_name,
                   ix.indisunique AS "unique", ix.indisprimary AS "primary",
                   ix.indisvalid AS valid, ix.indisready AS ready,
                   pg_get_expr(ix.indpred, ix.indrelid) AS partial_predicate,
                   pg_get_indexdef(i.oid) AS index_definition
            FROM pg_index ix
            JOIN pg_class i ON ix.indexrelid = i.oid
            JOIN pg_class c ON ix.indrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
            ORDER BY schema, table_name, index_name
        `,
        functions: `
            SELECT n.nspname AS schema, p.proname AS name, p.oid,
                   pg_get_function_arguments(p.oid) AS arguments,
                   pg_get_function_result(p.oid) AS return_type,
                   l.lanname AS language,
                   p.provolatile AS volatility, p.proparallel AS parallel_safety,
                   p.prosecdef AS security_mode, p.proleakproof AS leakproof,
                   p.proconfig AS configuration,
                   pg_get_functiondef(p.oid) AS definition,
                   obj_description(p.oid, 'pg_proc') AS comment,
                   pg_get_userbyid(p.proowner) AS owner
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            JOIN pg_language l ON p.prolang = l.oid
            WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
              AND p.prokind != 'a'
            ORDER BY schema, name, arguments
        `,
        views: `
            SELECT n.nspname AS schema, c.relname AS name,
                   pg_get_userbyid(c.relowner) AS owner,
                   pg_get_viewdef(c.oid, true) AS definition,
                   obj_description(c.oid, 'pg_class') AS comment
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE c.relkind = 'v'
              AND n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
            ORDER BY schema, name
        `,
        materialized_views: `
            SELECT n.nspname AS schema, c.relname AS name,
                   pg_get_userbyid(c.relowner) AS owner,
                   pg_get_viewdef(c.oid, true) AS definition,
                   obj_description(c.oid, 'pg_class') AS comment
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE c.relkind = 'm'
              AND n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
            ORDER BY schema, name
        `,
        triggers: `
            SELECT n.nspname AS schema, c.relname AS table_name,
                   t.tgname AS trigger_name,
                   pg_get_triggerdef(t.oid) AS definition,
                   p.proname AS function_name,
                   pn.nspname AS function_schema
            FROM pg_trigger t
            JOIN pg_class c ON t.tgrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            JOIN pg_proc p ON t.tgfoid = p.oid
            JOIN pg_namespace pn ON p.pronamespace = pn.oid
            WHERE NOT t.tgisinternal
              AND n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
            ORDER BY schema, table_name, trigger_name
        `,
        rls_policies: `
            SELECT schemaname AS schema, tablename AS table_name,
                   policyname AS policy_name,
                   permissive, roles, cmd AS command,
                   qual AS using, with_check
            FROM pg_policies
            WHERE schemaname NOT LIKE 'pg_%' AND schemaname != 'information_schema'
            ORDER BY schema, table_name, policy_name
        `,
        grants: `
            SELECT * FROM (
                SELECT n.nspname AS schema, c.relname AS object_name, 
                       CASE c.relkind WHEN 'r' THEN 'table' WHEN 'v' THEN 'view' WHEN 'S' THEN 'sequence' WHEN 'm' THEN 'materialized_view' ELSE 'other' END AS object_type,
                       (aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner)))).grantor::regrole::text AS grantor,
                       (aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner)))).grantee::regrole::text AS grantee,
                       (aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner)))).privilege_type AS privilege_type,
                       (aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner)))).is_grantable AS is_grantable
                FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid
                WHERE c.relkind IN ('r', 'v', 'S', 'm') AND n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
                UNION ALL
                SELECT n.nspname AS schema, p.proname AS object_name, 'function' AS object_type,
                       (aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner)))).grantor::regrole::text AS grantor,
                       (aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner)))).grantee::regrole::text AS grantee,
                       (aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner)))).privilege_type AS privilege_type,
                       (aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner)))).is_grantable AS is_grantable
                FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
                WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
                UNION ALL
                SELECT n.nspname AS schema, n.nspname AS object_name, 'schema' AS object_type,
                       (aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner)))).grantor::regrole::text AS grantor,
                       (aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner)))).grantee::regrole::text AS grantee,
                       (aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner)))).privilege_type AS privilege_type,
                       (aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner)))).is_grantable AS is_grantable
                FROM pg_namespace n
                WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
            ) all_grants
            ORDER BY schema, object_type, object_name, grantee, privilege_type
        `,
        dependencies: `
            SELECT 
                (pg_identify_object(d.classid, d.objid, d.objsubid)).type AS dependent_type,
                (pg_identify_object(d.classid, d.objid, d.objsubid)).identity AS dependent_identity,
                (pg_identify_object(d.refclassid, d.refobjid, d.refobjsubid)).type AS referenced_type,
                (pg_identify_object(d.refclassid, d.refobjid, d.refobjsubid)).identity AS referenced_identity,
                d.deptype
            FROM pg_depend d
            WHERE d.deptype != 'p'
        `
    };
    
    const extractionKeys = [
        'schemas', 'extensions', 'types', 'sequences', 'tables', 
        'columns', 'constraints', 'indexes', 'functions', 'views', 
        'materialized_views', 'triggers', 'rls_policies', 'grants', 'dependencies'
    ];
    
    try {
        for (const key of extractionKeys) {
            console.log("Extracting " + key + "...");
            catalog[key] = executeQuery(queries[key]);
        }
        
        // Post-process dependencies to filter out pg_catalog components properly
        catalog.dependencies = catalog.dependencies.filter(d => 
            !d.dependent_identity.includes('pg_catalog') && 
            !d.referenced_identity.includes('pg_catalog') &&
            !d.dependent_identity.startsWith('public.supabase') &&
            !d.referenced_identity.startsWith('public.supabase')
        );
        
        console.log("Extracting migration history...");
        catalog.migration_history = getMigrationHistory();
        
        catalog.metadata.schemas_inspected = catalog.schemas.map(s => s.schema_name);
        
        // Count validation
        catalog.metadata.counts = {
            schemas: catalog.schemas.length,
            extensions: catalog.extensions.length,
            types: catalog.types.length,
            sequences: catalog.sequences.length,
            tables: catalog.tables.length,
            columns: catalog.columns.length,
            constraints: catalog.constraints.length,
            indexes: catalog.indexes.length,
            functions: catalog.functions.length,
            views: catalog.views.length,
            materialized_views: catalog.materialized_views.length,
            triggers: catalog.triggers.length,
            rls_policies: catalog.rls_policies.length,
            grants: catalog.grants.length,
            dependencies: catalog.dependencies.length,
            pks: catalog.constraints.filter(c => c.type === 'p').length,
            fks: catalog.constraints.filter(c => c.type === 'f').length,
            unique_constraints: catalog.constraints.filter(c => c.type === 'u').length,
            check_constraints: catalog.constraints.filter(c => c.type === 'c').length,
            rls_tables: catalog.tables.filter(t => t.rls_enabled).length,
            enums: catalog.types.filter(t => t.typtype === 'e').length,
            domains: catalog.types.filter(t => t.typtype === 'd').length,
            user_defined_composites: catalog.types.filter(t => t.typtype === 'c' && t.relkind === 'c').length
        };
        
        const artifactsDir = path.join(process.cwd(), 'artifacts');
        try { mkdirSync(artifactsDir, { recursive: true }); } catch (e) {}
        
        writeFileSync(path.join(artifactsDir, 'live-schema-catalog.json'), JSON.stringify(catalog, null, 2));
        console.log("Extraction complete. Wrote artifacts/live-schema-catalog.json");
        
    } catch (e) {
        catalog.metadata.status = "FAILED";
        catalog.metadata.error = e.message;
        const artifactsDir = path.join(process.cwd(), 'artifacts');
        try { mkdirSync(artifactsDir, { recursive: true }); } catch (err) {}
        writeFileSync(path.join(artifactsDir, 'live-schema-catalog.json'), JSON.stringify(catalog, null, 2));
        process.exit(1);
    }
}

main();
