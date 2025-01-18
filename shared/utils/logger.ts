import { type LogObject, type ConsolaReporter, consola } from "consola";

export function getLogReporters() {
  const config = useAppConfig();
  const functions: ConsolaReporter["log"][] =  (config?.log as any)?.reporters || [];

  const reporters = functions.map((func) => ({ log: func }));
  if (!reporters.length) {
    reporters.push({
      log: (logObj: LogObject) => {
        consola[logObj.type](...(logObj.args as [any]));
      },
    });
  }

  return reporters;
}
