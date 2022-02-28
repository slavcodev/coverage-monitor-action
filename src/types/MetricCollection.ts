import Metric from './Metric';
import MetricType from './MetricType';

type MetricCollection<T = Metric> = Record<MetricType, T>;

export default MetricCollection;
