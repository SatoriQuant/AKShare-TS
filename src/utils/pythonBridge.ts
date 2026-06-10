/**
 * AKShare TypeScript - Python 回退桥接
 */

import { spawn } from 'child_process';
import path from 'path';

const ROOT = path.join(__dirname, '..', '..');

export interface PythonDataFrameResult {
  ok: boolean;
  columns?: string[];
  data?: any[][];
  error?: string;
}

export function runPythonDataFrameFunction(functionName: string, args: any[] = []): Promise<PythonDataFrameResult> {
  return new Promise((resolve) => {
    const akPath = path.join(ROOT, 'akshare').replace(/\\/g, '\\\\');
    const script = [
      'import sys, json, warnings',
      'import pandas as pd',
      'warnings.filterwarnings("ignore")',
      `sys.path.insert(0, r'${akPath}')`,
      'import akshare as ak',
      'try:',
      `    func = getattr(ak, ${JSON.stringify(functionName)})`,
      `    result = func(*${JSON.stringify(args)})`,
      '    if isinstance(result, pd.DataFrame):',
      '        cols = [str(x) for x in result.columns.tolist()]',
      '        data = [[str(v) for v in row] for row in result.head(1000).fillna("").astype(str).values.tolist()]',
      '        print(json.dumps({"ok": True, "columns": cols, "data": data}))',
      '    else:',
      '        print(json.dumps({"ok": False, "error": "result is not a DataFrame"}))',
      'except Exception as e:',
      '    print(json.dumps({"ok": False, "error": str(e)[:800]}))',
    ].join('\n');

    const proc = spawn('python', ['-c', script], { cwd: ROOT });
    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill();
      resolve({ ok: false, error: '超时（30秒）' });
    }, 30000);

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('close', () => {
      clearTimeout(timer);
      const lines = stdout.trim().split('\n').filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i -= 1) {
        try {
          resolve(JSON.parse(lines[i]));
          return;
        } catch {
          continue;
        }
      }
      resolve({ ok: false, error: (stderr.trim() || stdout.trim() || '无输出').slice(0, 800) });
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      resolve({ ok: false, error: error.message });
    });
  });
}