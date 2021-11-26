import path from 'path';
import getConfig from 'next/config';
import { readFileSync } from "fs";
import { NextApiRequest } from "next";
import { StatusCodes } from 'http-status-codes';
import { Measures, Metrics } from '../../types/metrics';

/**
 * Gets all measures from a project
 * @param fileName requested project CSV filename
 * @returns all measures from before and after all detected refactoring commits of requested project 
 */
const getMetrics = async (fileName: string): Promise<Measures> => {
  const rootDir = getConfig().serverRuntimeConfig.PROJECT_ROOT;
  const filePath = path.join(rootDir, `source`, `metrics`, `${fileName}.csv`);
  const metricsCsv = readFileSync(filePath).toString('utf8');
  const measures = {} as Measures;
  metricsCsv.split(`\n`).forEach(line => {
    const [isAfterCommit, commitId, comment_lines, complexity, lines, statements] = line.split(`;`);
    if (isAfterCommit !== `isAfterCommit`) {
      const property = isAfterCommit === 'true' ? 'after' : 'before';
      if (!measures[commitId]) measures[commitId] = { before: {} as Metrics, after: {} as Metrics };
      measures[commitId][property] = { 
        comment_lines: Number(comment_lines),
        complexity: Number(complexity),
        lines: Number(lines),
        statements: Number(statements),
      };
    }
  });
  return measures;
};

export default async function handler(req: NextApiRequest, res) {
  const filename = req.query.filename as string;
  if (!filename) res.status(StatusCodes.BAD_REQUEST).json(new Error(`Please, provide a valid source`));
  const metrics = await getMetrics(filename);
  res.status(200).json(metrics)
}
