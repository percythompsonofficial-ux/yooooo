declare module "sql.js/dist/sql-asm.js" {
  export interface Statement {
    run(params?: unknown[]): void;
    free(): void;
  }
  export interface Database {
    run(sql: string, params?: unknown[]): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }
  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => Database;
  }
  export default function initSqlJs(
    config?: Record<string, unknown>,
  ): Promise<SqlJsStatic>;
}
