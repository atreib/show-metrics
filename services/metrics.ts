import axios from 'axios';
import { Commits } from '../types/commits';
import { Measures } from '../types/metrics';

const METRICSAPI = axios.create({
    baseURL: `/api/`
});

const getErrorMessage = (err: any) => {
    return err.response.data.message;
}

/**
 * Gets all metrics from a specific CSV file
 * @param sourceFileName CSV file name that is going to be the metrics' source
 */
export const getMetrics = async (sourceFileName: string): Promise<Measures> => {
    try {
        const { data } = await METRICSAPI.get(`metrics/?filename=${sourceFileName}`);
        return data;
    } catch (err) { throw new Error(getErrorMessage(err)); }
};

/**
 * Gets all commits from a specific CSV file
 * @param sourceFileName CSV file name that is going to be the commits' source
 */
export const getCommits = async (sourceFileName: string): Promise<Commits> => {
    try {
        const { data } = await METRICSAPI.get(`commits/?filename=${sourceFileName}`);
        return data;
    } catch (err) { throw new Error(getErrorMessage(err)); }
}