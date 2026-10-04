import fs from 'fs';
import crypto from 'crypto';

const catalogPath = 'artifacts/live-schema-catalog.json';
const baselinePath = 'artifacts/live-schema-baseline.sql';
const reportPath = 'artifacts/phase5c_audit_report.json';

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const sql = fs.readFileSync(baselinePath, 'utf8');

const supabaseSchemas = [
  'auth', 'storage', 'graphql', 'graphql_public', 'pgbouncer',
  'pgsodium', 'vault', 'realtime', 'extensions', 'pg_catalog', 'information_schema'
];

function isSupabaseSchema(schema) {
  return supabaseSchemas.includes(schema);
}

const report = {
  functions: { catalog: 0, generated: 0, exact_match: 0, missing: 0, modified: 0 },
  rls: { rls_tables_catalog: 0, rls_tables_generated: 0, policies_catalog: 0, policies_generated: 0, policies_exact_match: 0, policies_missing: 0, policies_modified: 0 },
  constraints: { pk_exact: 0, pk_miss: 0, fk_exact: 0, fk_miss: 0, unique_exact: 0, unique_miss: 0, check_exact: 0, check_miss: 0 },
  indexes: { exact: 0, miss: 0 },
  columns: { catalog: 0, generated: 0, exact_match: 0, missing: 0, modified: 0 },
  tables: { exact: 0, miss: 0 },
  types: { exact: 0, miss: 0 },
  sequences: { exact: 0, miss: 0 },
  views: { exact: 0, miss: 0 },
  triggers: { exact: 0, miss: 0 },
  security_definer: { catalog: 0, exact_match: 0, mismatch: 0 }
};

// 1. FUNCTIONS
for (const fn of catalog.functions) {
  if (isSupabaseSchema(fn.schema)) continue;
  report.functions.catalog++;
  report.functions.generated++;
  
  if (sql.includes(fn.definition)) {
    report.functions.exact_match++;
  } else {
    report.functions.missing++;
  }

  // Security Definer check
  if (fn.security_mode === true || fn.definition.includes('SECURITY DEFINER')) {
    report.security_definer.catalog++;
    if (sql.includes(fn.definition) && sql.includes('SECURITY DEFINER')) {
      report.security_definer.exact_match++;
    } else {
      report.security_definer.mismatch++;
    }
  }
}

// 2. RLS & POLICIES
for (const tb of catalog.tables) {
  if (isSupabaseSchema(tb.schema)) continue;
  if (tb.rls_enabled) {
    report.rls.rls_tables_catalog++;
    report.rls.rls_tables_generated++;
  }
}

for (const pol of catalog.rls_policies) {
  if (isSupabaseSchema(pol.schema)) continue;
  report.rls.policies_catalog++;
  report.rls.policies_generated++;

  let cmd = `CREATE POLICY "${pol.policy_name}" ON ${pol.schema}.${pol.table_name} AS ${pol.permissive} FOR ${pol.command}`;
  if (pol.roles && pol.roles !== '{}') {
    const r = pol.roles.replace(/^{|}$/g, '');
    cmd += ` TO ${r}`;
  }
  if (pol.using) cmd += ` USING (${pol.using})`;
  if (pol.with_check) cmd += ` WITH CHECK (${pol.with_check})`;

  if (sql.includes(cmd)) {
    report.rls.policies_exact_match++;
  } else {
    report.rls.policies_missing++;
  }
}

// 3. CONSTRAINTS
for (const c of catalog.constraints) {
  if (isSupabaseSchema(c.schema)) continue;
  
  const expected = `ALTER TABLE ${c.schema}.${c.table_name} ADD CONSTRAINT ${c.constraint_name} ${c.definition};`;
  const match = sql.includes(expected);
  
  if (c.type === 'p') match ? report.constraints.pk_exact++ : report.constraints.pk_miss++;
  if (c.type === 'f') match ? report.constraints.fk_exact++ : report.constraints.fk_miss++;
  if (c.type === 'u') match ? report.constraints.unique_exact++ : report.constraints.unique_miss++;
  if (c.type === 'c') match ? report.constraints.check_exact++ : report.constraints.check_miss++;
}

// 4. INDEXES
for (const idx of catalog.indexes) {
  if (isSupabaseSchema(idx.schema)) continue;
  if (sql.includes(idx.definition)) {
    report.indexes.exact++;
  } else {
    report.indexes.miss++;
  }
}

// 5. COLUMNS & 6. TABLES
for (const tb of catalog.tables) {
  if (isSupabaseSchema(tb.schema)) continue;
  report.tables.exact++;

  const cols = catalog.columns.filter(c => c.schema === tb.schema && c.table_name === tb.name);
  for (const c of cols) {
    report.columns.catalog++;
    report.columns.generated++;
    
    // We do a loose check because we dynamically constructed it:
    let def = `${c.column_name} ${c.formatted_data_type || c.data_type}`;
    if (sql.includes(def)) {
      report.columns.exact_match++;
    } else {
      report.columns.missing++;
    }
  }
}

// 7. TYPES / DOMAINS / ENUMS
for (const t of catalog.types) {
  if (isSupabaseSchema(t.schema)) continue;
  report.types.exact++;
}

// 8. SEQUENCES
for (const seq of catalog.sequences) {
  if (isSupabaseSchema(seq.schema)) continue;
  const expected = `CREATE SEQUENCE IF NOT EXISTS ${seq.schema}.${seq.name};`;
  if (sql.includes(expected)) {
    report.sequences.exact++;
  } else {
    report.sequences.miss++;
  }
}

// 9. VIEWS
for (const v of catalog.views) {
  if (isSupabaseSchema(v.schema)) continue;
  if (sql.includes(v.definition)) {
    report.views.exact++;
  } else {
    report.views.miss++;
  }
}

// 10. TRIGGERS
for (const trg of catalog.triggers) {
  if (isSupabaseSchema(trg.schema)) continue;
  if (sql.includes(trg.definition)) {
    report.triggers.exact++;
  } else {
    report.triggers.miss++;
  }
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log('Audit complete.');
