import React, { useEffect, useState } from 'react';
import { Commits } from '../types/commits';
import { Measures } from '../types/metrics';
import { getCommits, getMetrics } from './../services/metrics';

interface Balance {
  increase: number;
  decrease: number;
  maintain: number;
}

enum InternalQualityAttributes {
  COMPLEXITY,
  SIZE
};

const attributesTechniques = {};
attributesTechniques[InternalQualityAttributes.COMPLEXITY] = ['MOVE', 'MOVE_RENAME'];
attributesTechniques[InternalQualityAttributes.SIZE] = ['MOVE_RENAME', 'EXTRACT', 'INLINE', 'RENAME'];

const HomePage = () => {
  const [filename, setFilename] = useState('');
  const [commits, setCommits] = useState<Commits>(undefined);
  const [metrics, setMetrics] = useState<Measures>(undefined);
  const [complexityCommits, setComplexityCommits] = useState<string[]>(undefined);
  const [sizeCommits, setSizeCommits] = useState(undefined);

  // complexity metrics
  const [complexityOverTime, setComplexityOverTime] = useState<string[]>(undefined); // cc

  // size metrics
  const [linesOverTime, setLinesOverTime] = useState<string[]>(undefined);
  const [lineWCommentsOverTime, setLinesWCommentsOverTime] = useState<string[]>(undefined);
  const [statementsOverTime, setStatementsOverTime] = useState<string[]>();

  // balances
  const [complexityBalance, setComplexityBalance] = useState<Balance>();
  const [linesBalance, setLinesBalance] = useState<Balance>();
  const [linesWCommentBalance, setLinesWCommentBalance] = useState<Balance>();
  const [statementsBalance, setStatementsBalance] = useState<Balance>();

  const loadMetrics = async (providedFileName: string): Promise<Measures> => {
    try {
      return await getMetrics(providedFileName);
    } catch (err) { console.error(err); }
  }

  const loadCommits = async (providedFileName: string): Promise<Commits> => {
    try {
      return await getCommits(providedFileName);
    } catch (err) { console.error(err); }
  }

  const loadData = async () => {
    if (!filename) return;
    setCommits(await loadCommits(filename));
    setMetrics(await loadMetrics(filename));
  };

  useEffect(() => {
    if (!commits) return;

    // checking which commits are related to complexity
    const _complexityCommits = Object.keys(commits).map(commit => {
      const thisCommitTechniques = commits[commit];
      if (thisCommitTechniques.some(x => attributesTechniques[InternalQualityAttributes.COMPLEXITY].includes(x))) 
        return commit;
    }).filter(x => !!x);;
    setComplexityCommits(_complexityCommits);

    // checking which commits are related to size
    const _sizeCommits = Object.keys(commits).map(commit => {
      const thisCommitTechniques = commits[commit];
      if (thisCommitTechniques.some(x => attributesTechniques[InternalQualityAttributes.SIZE].includes(x))) 
        return commit;
    }).filter(x => !!x);;
    setSizeCommits(_sizeCommits);

  }, [commits]);

  useEffect(() => {
    if (!metrics || !complexityCommits) return;

    // 1 of complexity is the best and minimum
    // for this measure: the lower, the better;
    const complexityBalance = { increase: 0, decrease: 0, maintain: 0 };
    const _complexityOverTime = Object.keys(metrics).map(commit => {
      if (complexityCommits.includes(commit)) {
        const commitMetrics = metrics[commit];
        // must be negative to be an improvement
        if (commitMetrics.after && commitMetrics.before) {
          if (commitMetrics.before.complexity === commitMetrics.after.complexity) complexityBalance.maintain++;
          if (commitMetrics.before.complexity > commitMetrics.after.complexity) complexityBalance.decrease++;
          if (commitMetrics.before.complexity < commitMetrics.after.complexity) complexityBalance.increase++;
          return `${commitMetrics.before.complexity} -> ${commitMetrics.after.complexity}`;
        }
      }
    }).filter(x => !!x);
    setComplexityBalance(complexityBalance);
    setComplexityOverTime(_complexityOverTime);
    
  }, [metrics, complexityCommits]);

  useEffect(() => {
    if (!metrics || !sizeCommits) return;

    // the lower, the better ????
    const linesBalance = { increase: 0, decrease: 0, maintain: 0 };
    const _linesOverTime = Object.keys(metrics).map(commit => {
      if (sizeCommits.includes(commit)) {
        const commitMetrics = metrics[commit];
        if (commitMetrics.after && commitMetrics.before) {
          if (commitMetrics.before.lines === commitMetrics.after.lines) linesBalance.maintain++;
          if (commitMetrics.before.lines > commitMetrics.after.lines) linesBalance.decrease++;
          if (commitMetrics.before.lines < commitMetrics.after.lines) linesBalance.increase++;
          return `${commitMetrics.before.lines} - ${commitMetrics.after.lines}`;
        }
      }
    }).filter(x => !!x);;
    setLinesBalance(linesBalance);
    setLinesOverTime(_linesOverTime);

    // the lower, the better ????
    const linesWCommentBalance = { increase: 0, decrease: 0, maintain: 0 };
    const _linesWithCommentsOverTime = Object.keys(metrics).map(commit => {
      if (sizeCommits.includes(commit)) {
        const commitMetrics = metrics[commit];
        if (commitMetrics.after && commitMetrics.before) {
          if (commitMetrics.before.comment_lines === commitMetrics.after.comment_lines) linesWCommentBalance.maintain++;
          if (commitMetrics.before.comment_lines > commitMetrics.after.comment_lines) linesWCommentBalance.decrease++;
          if (commitMetrics.before.comment_lines < commitMetrics.after.comment_lines) linesWCommentBalance.increase++;
          return `${commitMetrics.before.comment_lines} - ${commitMetrics.after.comment_lines}`;
        }
      }
    }).filter(x => !!x);
    setLinesWCommentBalance(linesWCommentBalance);
    setLinesWCommentsOverTime(_linesWithCommentsOverTime);

    // the lower, the better ????
    const statementsBalance = { increase: 0, decrease: 0, maintain: 0 };
    const _statements = Object.keys(metrics).map(commit => {
      if (sizeCommits.includes(commit)) {
        const commitMetrics = metrics[commit];
        if (commitMetrics.after && commitMetrics.before) {
          if (commitMetrics.before.statements === commitMetrics.after.statements) statementsBalance.maintain++;
          if (commitMetrics.before.statements > commitMetrics.after.statements) statementsBalance.decrease++;
          if (commitMetrics.before.statements < commitMetrics.after.statements) statementsBalance.increase++;
          return `${commitMetrics.before.statements} - ${commitMetrics.after.statements}`;
        }
      }
    }).filter(x => !!x);
    setStatementsBalance(statementsBalance);
    setStatementsOverTime(_statements);
    
  }, [metrics, sizeCommits]);

  return (
    <div className="bg-black text-green-500 h-full absolute w-full">
      <div className='flex flex-col space-y-4 items-center justify-center p-4 shadow-sm'>
        CSV Source File Name:
        <input type='text' className="bg-black text-green-500 border border-green-500" onChange={(event) => setFilename(event.target.value)} />
        <input type='button' className="bg-black text-green-500 border border-green-500 py-2 px-4 cursor-pointer" onClick={loadData} value={'Fetch'} />
      </div>
      <div className={"flex flex-row justify-around"}>
        <div className="m-8 overflow-scroll max-h-96 border border-green-500 p-8">
          <h1 className="text-4xl">Complexity metrics</h1>
          <div>
            {complexityOverTime && <div>
              <div>
                <h2 className="text-2xl py-4">Cyclomatic Complexity (CC)</h2>
              </div>
              <div>
                Total of commits: {complexityOverTime.length}
              </div>
              <div>
                Commits that increased the CC: {complexityBalance.increase}
              </div>
              <div>
                Commits that decreased the CC: {complexityBalance.decrease}
              </div>
              <div>
                Commits that maintained the CC: {complexityBalance.maintain}
              </div>
              <div className="text-lg my-4">
                <div className="text-red-500">
                  {`${((complexityBalance.increase * 100) / 
                      (complexityBalance.increase + complexityBalance.decrease + complexityBalance.maintain)
                    ).toFixed(2)}% of worsening`}
                </div>
                <div className="text-blue-500">
                  {`${((complexityBalance.decrease * 100) / 
                      (complexityBalance.increase + complexityBalance.decrease + complexityBalance.maintain)
                    ).toFixed(2)}% of improvement`}
                </div>
                <div className="text-white">
                  {`${((complexityBalance.maintain * 100) / 
                      (complexityBalance.increase + complexityBalance.decrease + complexityBalance.maintain)
                    ).toFixed(2)}% do not impact`}
                </div>
              </div>
              {/* <div>
                {complexityOverTime.map((x, i) => <div key={i}>{x}</div>)}
              </div> */}
            </div>}
          </div>
        </div>
        <div className="m-8 overflow-scroll max-h-96 border border-green-500 p-8">
          <h1 className="text-4xl">Size metrics</h1>
          <div>
            {linesOverTime && <div>
              <div>
                <h2 className="text-2xl py-4">Lines (LOC)</h2>
              </div>
              <div>
                Total of commits: {linesOverTime.length}
              </div>
              <div>
                Commits that increased the LOC: {linesBalance.increase}
              </div>
              <div>
                Commits that decreased the LOC: {linesBalance.decrease}
              </div>
              <div>
                Commits that maintained the LOC: {linesBalance.maintain}
              </div>
              <div className="text-lg my-4">
                <div className="text-red-500">
                  {`${((linesBalance.increase * 100) / 
                      (linesBalance.increase + linesBalance.decrease + linesBalance.maintain)
                    ).toFixed(2)}% of worsening`}
                </div>
                <div className="text-blue-500">
                  {`${((linesBalance.decrease * 100) / 
                      (linesBalance.increase + linesBalance.decrease + linesBalance.maintain)
                    ).toFixed(2)}% of improvement`}
                </div>
                <div className="text-white">
                  {`${((linesBalance.maintain * 100) / 
                      (linesBalance.increase + linesBalance.decrease + linesBalance.maintain)
                    ).toFixed(2)}% do not impact`}
                </div>
              </div>
             {/*  <div>
                {linesOverTime.map((x, i) => <div key={i}>{x}</div>)}
              </div> */}
            </div>}
            {lineWCommentsOverTime && <div>
              <div>
                <h2 className="text-2xl py-4">Lines with comments (CLOC)</h2>
              </div>
              <div>
                Total of commits: {lineWCommentsOverTime.length}
              </div>
              <div>
                Commits that increased the CLOC: {linesWCommentBalance.increase}
              </div>
              <div>
                Commits that decreased the CLOC: {linesWCommentBalance.decrease}
              </div>
              <div>
                Commits that maintained the CLOC: {linesWCommentBalance.maintain}
              </div>
              <div className="text-lg my-4">
                <div className="text-red-500">
                  {`${((linesWCommentBalance.increase * 100) / 
                      (linesWCommentBalance.increase + linesWCommentBalance.decrease + linesWCommentBalance.maintain)
                    ).toFixed(2)}% of worsening`}
                </div>
                <div className="text-blue-500">
                  {`${((linesWCommentBalance.decrease * 100) / 
                      (linesWCommentBalance.increase + linesWCommentBalance.decrease + linesWCommentBalance.maintain)
                    ).toFixed(2)}% of improvement`}
                </div>
                <div className="text-white">
                  {`${((linesWCommentBalance.maintain * 100) / 
                      (linesWCommentBalance.increase + linesWCommentBalance.decrease + linesWCommentBalance.maintain)
                    ).toFixed(2)}% do not impact`}
                </div>
              </div>
              {/* <div>
                {lineWCommentsOverTime.map((x, i) => <div key={i}>{x}</div>)}
              </div> */}
            </div>}
            {statementsOverTime && <div>
              <div>
                <h2 className="text-2xl py-4">Statements (STMTC)</h2>
              </div>
              <div>
                Total of commits: {statementsOverTime.length}
              </div>
              <div>
                Commits that increased the STMTC: {statementsBalance.increase}
              </div>
              <div>
                Commits that decreased the STMTC: {statementsBalance.decrease}
              </div>
              <div>
                Commits that maintained the STMTC: {statementsBalance.maintain}
              </div>
              <div className="text-lg my-4">
                <div className="text-red-500">
                  {`${((statementsBalance.increase * 100) / 
                      (statementsBalance.increase + statementsBalance.decrease + statementsBalance.maintain)
                    ).toFixed(2)}% of worsening`}
                </div>
                <div className="text-blue-500">
                  {`${((statementsBalance.decrease * 100) / 
                      (statementsBalance.increase + statementsBalance.decrease + statementsBalance.maintain)
                    ).toFixed(2)}% of improvement`}
                </div>
                <div className="text-white">
                  {`${((statementsBalance.maintain * 100) / 
                      (statementsBalance.increase + statementsBalance.decrease + statementsBalance.maintain)
                    ).toFixed(2)}% do not impact`}
                </div>
              </div>
              {/* <div>
                {statementsOverTime.map((x, i) => <div key={i}>{x}</div>)}
              </div> */}
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage;