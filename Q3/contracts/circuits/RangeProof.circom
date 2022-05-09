pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template Multiplier2(){
   signal input in1;
   signal input in2;
   signal output out;

   out <== in1 * in2;
}

template RangeProof(n) {
    assert(n <= 252);
    signal input in; // this is the number to be proved inside the range
    signal input range[2]; // the two elements should be the range, i.e. [lower bound, upper bound]
    signal output out;

    component mult = Multiplier2();
    component comparators[2];

    component low = LessEqThan(n);
    component high = GreaterEqThan(n);

    // [assignment] insert your code here
    low.in[0] <== in;
    low.in[1] <== range[0];

    high.in[0] <== in;
    high.in[1] <== range[1];

    comparators[0] <== low.out;
    comparators[1] <== high.out;

    mult.in1 <== comparators[0].out;
    mult.in2 <== comparators[1].out;

    out <== mult.out;
}