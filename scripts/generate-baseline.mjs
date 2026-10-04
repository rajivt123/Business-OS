import fs from 'fs';
import path from 'path';

const catalogPath = 'artifacts/live-schema-catalog.json';
const baselinePath = 'artifacts/live-schema-baseline.sql';
const reportPath = 'artifacts/live-schema-baseline-report.json';

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const supabaseSchemas = [
  'auth', 'storage', 'graphql', 'graphql_public', 'pgbouncer',
  'pgsodium', 'vault', 'realtime', 'extensions', 'pg_catalog', 'information_schema'
];

let sql = '';
const generatedCounts = {
  schemas: 0,
  extensions: 0,
  types: 0,
  enums: 0,
  domains: 0,
  user_defined_composites: 0,
  sequences: 0,
  tables: 0,
  columns: 0,
  constraints: 0,
  pks: 0,
  fks: 0,
  unique_constraints: 0,
  check_constraints: 0,
  indexes: 0,
  functions: 0,
  views: 0,
  materialized_views: 0,
  triggers: 0,
  rls_tables: 0,
  rls_policies: 0,
  grants: 0
};

const omittedCounts = {
  schemas: 0,
  extensions: 0,
  types: 0,
  enums: 0,
  domains: 0,
  user_defined_composites: 0,
  sequences: 0,
  tables: 0,
  columns: 0,
  constraints: 0,
  pks: 0,
  fks: 0,
  unique_constraints: 0,
  check_constraints: 0,
  indexes: 0,
  functions: 0,
  views: 0,
  materialized_views: 0,
  triggers: 0,
  rls_tables: 0,
  rls_policies: 0,
  grants: 0
};

const omittedLog = [];

function out(str) {
  sql += str + '\n';
}

function omit(type, name, reason, subType = null) {
  omittedLog.push({ type, name, reason });
  out(`-- OMITTED ${type} ${name}: ${reason}`);
  
  if (type === 'SCHEMA') omittedCounts.schemas++;
  if (type === 'EXTENSION') omittedCounts.extensions++;
  if (type === 'TYPE') {
    omittedCounts.types++;
    if (subType === 'enum') omittedCounts.enums++;
    if (subType === 'domain') omittedCounts.domains++;
    if (subType === 'composite') omittedCounts.user_defined_composites++;
  }
  if (type === 'SEQUENCE') omittedCounts.sequences++;
  if (type === 'TABLE') omittedCounts.tables++;
  if (type === 'COLUMN') omittedCounts.columns++;
  if (type === 'CONSTRAINT') {
    omittedCounts.constraints++;
    if (subType === 'p') omittedCounts.pks++;
    if (subType === 'f') omittedCounts.fks++;
    if (subType === 'u') omittedCounts.unique_constraints++;
    if (subType === 'c') omittedCounts.check_constraints++;
  }
  if (type === 'INDEX') omittedCounts.indexes++;
  if (type === 'VIEW') omittedCounts.views++;
  if (type === 'MATERIALIZED_VIEW') omittedCounts.materialized_views++;
  if (type === 'FUNCTION') omittedCounts.functions++;
  if (type === 'TRIGGER') omittedCounts.triggers++;
  if (type === 'RLS') omittedCounts.rls_tables++;
  if (type === 'POLICY') omittedCounts.rls_policies++;
  if (type === 'GRANT') omittedCounts.grants++;
}

out(`-- SOURCE: live-schema-catalog.json`);
out(`-- PROJECT ID: ${catalog.metadata.project_id || 'ppffvhqzlufuutazvbhx'}`);
out(`-- EXTRACTION TIMESTAMP: ${catalog.metadata.timestamp}`);
out(`-- CATALOG COUNTS: ${JSON.stringify(catalog.metadata.counts)}`);
out(`-- GENERATOR VERSION: 1.4`);
out(`-- GENERATION TIMESTAMP: (Deterministic Build)`);
out(``);

function isSupabaseSchema(schema) {
  return supabaseSchemas.includes(schema);
}

// 01 SCHEMAS
out(`-- ==========================================`);
out(`-- SECTION 01: CREATE SCHEMAS`);
out(`-- ==========================================`);
const schemas = [...catalog.schemas].sort((a, b) => String(a.schema_name).localeCompare(String(b.schema_name)));
for (const s of schemas) {
  if (isSupabaseSchema(s.schema_name)) {
    omit('SCHEMA', s.schema_name, 'Supabase-managed schema');
    continue;
  }
  if (s.schema_name !== 'public') {
    out(`CREATE SCHEMA IF NOT EXISTS ${s.schema_name};`);
    generatedCounts.schemas++;
  }
}
out(``);

// 02 EXTENSIONS
out(`-- ==========================================`);
out(`-- SECTION 02: CREATE EXTENSIONS`);
out(`-- ==========================================`);
const extensions = [...catalog.extensions].sort((a, b) => String(a.name).localeCompare(String(b.name)));
for (const e of extensions) {
  // We allow vector, postgis, uuid-ossp, pgcrypto, etc.
  out(`CREATE EXTENSION IF NOT EXISTS "${e.name}" WITH SCHEMA ${e.schema};`);
  generatedCounts.extensions++;
}
out(``);

// 03 TYPES
out(`-- ==========================================`);
out(`-- SECTION 03: CREATE USER-DEFINED TYPES`);
out(`-- ==========================================`);
const types = [...catalog.types].sort((a, b) => String(a.schema + a.name).localeCompare(String(b.schema + b.name)));
for (const t of types) {
  if (isSupabaseSchema(t.schema)) {
    omit('TYPE', `${t.schema}.${t.name}`, 'Supabase-managed schema', t.type);
    continue;
  }
  
  if (t.type === 'enum') {
    out(`CREATE TYPE ${t.schema}.${t.name} AS ENUM (
  ${t.enum_labels.map(l => `'${l}'`).join(',\n  ')}
);`);
    generatedCounts.types++;
    generatedCounts.enums++;
  } else if (t.type === 'composite') {
    out(`-- COMPOSITE TYPE ${t.schema}.${t.name} (Attributes generation requires specific logic if present)`);
    generatedCounts.types++;
    generatedCounts.user_defined_composites++;
  } else if (t.type === 'domain') {
    out(`-- DOMAIN TYPE ${t.schema}.${t.name}`);
    generatedCounts.types++;
    generatedCounts.domains++;
  }
}
out(``);

// 04 SEQUENCES
out(`-- ==========================================`);
out(`-- SECTION 04: CREATE SEQUENCES`);
out(`-- ==========================================`);
const sequences = [...catalog.sequences].sort((a, b) => String(a.schema + a.name).localeCompare(String(b.schema + b.name)));
for (const seq of sequences) {
  if (isSupabaseSchema(seq.schema)) {
    omit('SEQUENCE', `${seq.schema}.${seq.name}`, 'Supabase-managed schema');
    continue;
  }
  out(`CREATE SEQUENCE IF NOT EXISTS ${seq.schema}.${seq.name};`);
  generatedCounts.sequences++;
}
out(``);

// 05 TABLES
out(`-- ==========================================`);
out(`-- SECTION 05: CREATE TABLES`);
out(`-- ==========================================`);
const tables = [...catalog.tables].sort((a, b) => String(a.schema + a.name).localeCompare(String(b.schema + b.name)));
for (const tb of tables) {
  if (isSupabaseSchema(tb.schema)) {
    omit('TABLE', `${tb.schema}.${tb.name}`, 'Supabase-managed schema');
    
    // Omit columns for this table as well to keep counts aligned
    const cols = catalog.columns.filter(c => c.schema === tb.schema && c.table_name === tb.name);
    for (const c of cols) {
      omit('COLUMN', `${tb.schema}.${tb.name}.${c.column_name}`, 'Supabase-managed schema');
    }
    continue;
  }
  
  const cols = catalog.columns.filter(c => c.schema === tb.schema && c.table_name === tb.name)
                .sort((a, b) => a.ordinal - b.ordinal);
  
  out(`CREATE TABLE IF NOT EXISTS ${tb.schema}.${tb.name} (`);
  const colDefs = [];
  for (const c of cols) {
    let def = `  ${c.column_name} ${c.formatted_data_type || c.data_type}`;
    if (!c.nullable) def += ` NOT NULL`;
    if (c.default_value) def += ` DEFAULT ${c.default_value}`;
    if (c.identity) def += ` GENERATED ${c.identity} AS IDENTITY`;
    if (c.generated) def += ` GENERATED ALWAYS AS (${c.generated}) STORED`;
    colDefs.push(def);
    generatedCounts.columns++;
  }
  out(colDefs.join(',\n'));
  out(`);`);
  generatedCounts.tables++;
}
out(``);

// 06 COMMENTS
out(`-- ==========================================`);
out(`-- SECTION 06: TABLE COMMENTS`);
out(`-- ==========================================`);
out(`-- (Not extracted or skipped)`);
out(``);

// 07 SEQUENCE OWNERSHIP
out(`-- ==========================================`);
out(`-- SECTION 07: SEQUENCE OWNERSHIP`);
out(`-- ==========================================`);
out(`-- (Not extracted or skipped)`);
out(``);

// 08 PRIMARY KEYS / UNIQUE CONSTRAINTS
out(`-- ==========================================`);
out(`-- SECTION 08: PRIMARY KEYS / UNIQUE CONSTRAINTS`);
out(`-- ==========================================`);
const pks_uniques = catalog.constraints
  .filter(c => c.type === 'p' || c.type === 'u')
  .sort((a, b) => String(a.schema + a.table_name + a.constraint_name).localeCompare(String(b.schema + b.table_name + b.constraint_name)));

for (const c of pks_uniques) {
  if (isSupabaseSchema(c.schema)) {
    omit('CONSTRAINT', `${c.schema}.${c.table_name}.${c.constraint_name}`, 'Supabase-managed schema', c.type);
    continue;
  }
  out(`ALTER TABLE ${c.schema}.${c.table_name} ADD CONSTRAINT ${c.constraint_name} ${c.definition};`);
  generatedCounts.constraints++;
  if (c.type === 'p') generatedCounts.pks++;
  if (c.type === 'u') generatedCounts.unique_constraints++;
}
out(``);

// 09 CHECK CONSTRAINTS
out(`-- ==========================================`);
out(`-- SECTION 09: CHECK CONSTRAINTS`);
out(`-- ==========================================`);
const checks = catalog.constraints
  .filter(c => c.type === 'c')
  .sort((a, b) => String(a.schema + a.table_name + a.constraint_name).localeCompare(String(b.schema + b.table_name + b.constraint_name)));

for (const c of checks) {
  if (isSupabaseSchema(c.schema)) {
    omit('CONSTRAINT', `${c.schema}.${c.table_name}.${c.constraint_name}`, 'Supabase-managed schema', c.type);
    continue;
  }
  out(`ALTER TABLE ${c.schema}.${c.table_name} ADD CONSTRAINT ${c.constraint_name} ${c.definition};`);
  generatedCounts.constraints++;
  generatedCounts.check_constraints++;
}
out(``);

// 10 FOREIGN KEYS
out(`-- ==========================================`);
out(`-- SECTION 10: FOREIGN KEYS`);
out(`-- ==========================================`);
const fks = catalog.constraints
  .filter(c => c.type === 'f')
  .sort((a, b) => String(a.schema + a.table_name + a.constraint_name).localeCompare(String(b.schema + b.table_name + b.constraint_name)));

for (const c of fks) {
  if (isSupabaseSchema(c.schema)) {
    omit('CONSTRAINT', `${c.schema}.${c.table_name}.${c.constraint_name}`, 'Supabase-managed schema', c.type);
    continue;
  }
  out(`ALTER TABLE ${c.schema}.${c.table_name} ADD CONSTRAINT ${c.constraint_name} ${c.definition};`);
  generatedCounts.constraints++;
  generatedCounts.fks++;
}
out(``);

// 11 INDEXES
out(`-- ==========================================`);
out(`-- SECTION 11: INDEXES`);
out(`-- ==========================================`);
const indexes = [...catalog.indexes].sort((a, b) => String(a.schema + a.table_name + a.index_name).localeCompare(String(b.schema + b.table_name + b.index_name)));
for (const idx of indexes) {
  if (isSupabaseSchema(idx.schema)) {
    omit('INDEX', `${idx.schema}.${idx.table_name}.${idx.index_name}`, 'Supabase-managed schema');
    continue;
  }
  out(`${idx.definition};`);
  generatedCounts.indexes++;
}
out(``);

// 12 VIEWS
out(`-- ==========================================`);
out(`-- SECTION 12: VIEWS`);
out(`-- ==========================================`);
const views = [...catalog.views].sort((a, b) => String(a.schema + a.name).localeCompare(String(b.schema + b.name)));
for (const v of views) {
  if (isSupabaseSchema(v.schema)) {
    omit('VIEW', `${v.schema}.${v.name}`, 'Supabase-managed schema');
    continue;
  }
  out(`CREATE OR REPLACE VIEW ${v.schema}.${v.name} AS\n${v.definition};`);
  generatedCounts.views++;
}
out(``);

// 13 MATERIALIZED VIEWS
out(`-- ==========================================`);
out(`-- SECTION 13: MATERIALIZED VIEWS`);
out(`-- ==========================================`);
out(`-- (None captured)`);
out(``);

// 14 FUNCTIONS
out(`-- ==========================================`);
out(`-- SECTION 14: FUNCTIONS`);
out(`-- ==========================================`);
const functions = [...catalog.functions].sort((a, b) => String(a.schema + a.name + a.arguments).localeCompare(String(b.schema + b.name + b.arguments)));
for (const fn of functions) {
  if (isSupabaseSchema(fn.schema)) {
    omit('FUNCTION', `${fn.schema}.${fn.name}`, 'Supabase-managed schema');
    continue;
  }
  out(`${fn.definition};\n`);
  generatedCounts.functions++;
}
out(``);

// 15 TRIGGERS
out(`-- ==========================================`);
out(`-- SECTION 15: TRIGGERS`);
out(`-- ==========================================`);
const triggers = [...catalog.triggers].sort((a, b) => String(a.schema + a.table_name + a.trigger_name).localeCompare(String(b.schema + b.table_name + b.trigger_name)));
for (const trg of triggers) {
  if (isSupabaseSchema(trg.schema)) {
    omit('TRIGGER', `${trg.schema}.${trg.table_name}.${trg.trigger_name}`, 'Supabase-managed schema');
    continue;
  }
  out(`${trg.definition};\n`);
  generatedCounts.triggers++;
}
out(``);

// 16 RLS ENABLE / FORCE
out(`-- ==========================================`);
out(`-- SECTION 16: RLS ENABLE / FORCE`);
out(`-- ==========================================`);
for (const tb of tables) {
  if (isSupabaseSchema(tb.schema)) {
    // we already omitted table, so rls is implicitly omitted
    if (tb.rls_enabled) omit('RLS', `${tb.schema}.${tb.name}`, 'Supabase-managed schema');
    continue;
  }
  if (tb.rls_enabled) {
    out(`ALTER TABLE ${tb.schema}.${tb.name} ENABLE ROW LEVEL SECURITY;`);
    generatedCounts.rls_tables++;
  }
  if (tb.rls_forced) {
    out(`ALTER TABLE ${tb.schema}.${tb.name} FORCE ROW LEVEL SECURITY;`);
  }
}
out(``);

// 17 RLS POLICIES
out(`-- ==========================================`);
out(`-- SECTION 17: RLS POLICIES`);
out(`-- ==========================================`);
const policies = [...catalog.rls_policies].sort((a, b) => String(a.schema + a.table_name + a.policy_name).localeCompare(String(b.schema + b.table_name + b.policy_name)));
for (const pol of policies) {
  if (isSupabaseSchema(pol.schema)) {
    omit('POLICY', `${pol.schema}.${pol.table_name}.${pol.policy_name}`, 'Supabase-managed schema');
    continue;
  }
  let cmd = `CREATE POLICY "${pol.policy_name}" ON ${pol.schema}.${pol.table_name} AS ${pol.permissive} FOR ${pol.command}`;
  if (pol.roles && pol.roles !== '{}') {
    const r = pol.roles.replace(/^{|}$/g, '');
    cmd += ` TO ${r}`;
  }
  if (pol.using) cmd += ` USING (${pol.using})`;
  if (pol.with_check) cmd += ` WITH CHECK (${pol.with_check})`;
  cmd += ';';
  out(cmd);
  generatedCounts.rls_policies++;
}
out(``);

// 18 GRANTS / PRIVILEGES
out(`-- ==========================================`);
out(`-- SECTION 18: GRANTS / PRIVILEGES`);
out(`-- ==========================================`);
out(`-- (Skipping for local baseline deterministic safety)`);
out(``);

// 19 OWNERSHIP
out(`-- ==========================================`);
out(`-- SECTION 19: OWNERSHIP`);
out(`-- ==========================================`);
out(`-- (Skipping ownership to avoid role issues in local baselines)`);
out(``);

fs.writeFileSync(baselinePath, sql);

const totalCounts = {};
for (const key of Object.keys(catalog.metadata.counts)) {
  totalCounts[key] = (generatedCounts[key] || 0) + (omittedCounts[key] || 0);
}

fs.writeFileSync(reportPath, JSON.stringify({
  generatedCounts,
  omittedCounts,
  totalCounts,
  catalogCounts: catalog.metadata.counts,
  omittedLog
}, null, 2));

console.log('Baseline generation complete.');
