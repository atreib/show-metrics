import path from 'path';
import getConfig from 'next/config';
import { readFileSync } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from 'http-status-codes';
import { Commits } from "../../types/commits";

/**
 * Gets all commits
 * @param fileName source filename
 * @returns all commits analyzed
 */
const getCommits = async (fileName: string): Promise<Commits> => {
  const rootDir = getConfig().serverRuntimeConfig.PROJECT_ROOT;
  const filePath = path.join(rootDir, `source`, `commits`, `${fileName}.csv`);
  const commitsCsv = readFileSync(filePath).toString('utf8');
  const commits = {} as Commits;
  commitsCsv.split(`\n`).forEach(line => {
    const [commitId, refactoringTechnique,] = line.split(`,`);
    commits[commitId] = commits[commitId] ? [...new Set([...commits[commitId], refactoringTechnique])] : [refactoringTechnique];
  });
  return commits;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const filename = req.query.filename as string;
  if (!filename) res.status(StatusCodes.BAD_REQUEST).json(new Error(`Please, provide a valid source`));
  const metrics = await getCommits(filename);
  res.status(200).json(metrics)
}
