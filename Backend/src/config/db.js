import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const {
  MSSQL_CONNECTION_STRING,
  DB_SERVER,
  DB_DATABASE,
  DB_USER,
  DB_PASSWORD,
  DB_ENCRYPT = 'true',
  DB_TRUST_SERVER_CERTIFICATE = 'true',
} = process.env;

let poolPromise;

export function getDbConfig() {
  if (MSSQL_CONNECTION_STRING && MSSQL_CONNECTION_STRING.trim().length > 0) {
    return MSSQL_CONNECTION_STRING;
  }

  const encryptBool = String(DB_ENCRYPT).toLowerCase() === 'true';
  const trustCertBool = String(DB_TRUST_SERVER_CERTIFICATE).toLowerCase() === 'true';

  // Fallback to QA defaults if envs are not provided
  const fallback = {
    server: '67.211.223.122',
    database: 'YugalkunjDbQA',
    user: 'sevadmin',
    password: 'jx819y!M',
  };

  const cfg = {
    server: DB_SERVER || fallback.server,
    database: DB_DATABASE || fallback.database,
    user: DB_USER || fallback.user,
    password: DB_PASSWORD || fallback.password,
    options: {
      encrypt: encryptBool,
      trustServerCertificate: trustCertBool,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

  if ((!DB_SERVER || !DB_DATABASE || !DB_USER || !DB_PASSWORD) && !MSSQL_CONNECTION_STRING) {
    console.warn('[MSSQL CONFIG WARNING] Missing .env DB_* values. Falling back to QA defaults.');
  }

  // Minimal visibility at startup (no password)
  console.log('[MSSQL CONFIG]', {
    server: cfg.server,
    database: cfg.database,
    user: cfg.user,
    encrypt: cfg.options.encrypt,
    trustServerCertificate: cfg.options.trustServerCertificate,
  });

  return cfg;
}

export function getPool() {
  if (!poolPromise) {
    const config = getDbConfig();
    poolPromise = sql.connect(config);
  }
  return poolPromise;
}

export { sql };
