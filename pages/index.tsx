import React, { useEffect, useState } from 'react';
import { getCommits, getMetrics} from './../services/metrics';

const HomePage = () => {
  const [filename, setFilename] = useState('');
  const [commits, setCommits] = useState(undefined);
  const [metrics, setMetrics] = useState(undefined);

  const loadMetrics = async (providedFileName: string) => {
    try {
      return await getMetrics(providedFileName);
    } catch (err) { console.error(err); }
  }

  const loadCommits = async (providedFileName: string) => {
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
    console.log(`commits: `, commits);
  }, [commits]);

  useEffect(() => {
    console.log(`metrics: `, metrics);
  }, [metrics]);

  return (
    <div>
      Type a source filename:
      <input type='text' onChange={(event) => setFilename(event.target.value)} />
      <input type='button' onClick={loadData} value={'Fetch'} />
    </div>
  )
}

export default HomePage;