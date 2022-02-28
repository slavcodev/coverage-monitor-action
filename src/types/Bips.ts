/**
 * Basis points, otherwise known as bps or "bips," are a unit of measure used in finance to describe the percentage rate.
 * The benefit of using bips is to avoid usage of float numbers.
 *
 * One basis point is equivalent to 0.01%, i.e. 100% is 10000 bips. This means the number allowed is from 0 to 10000.
 */
type Bips = number;

export default Bips;
