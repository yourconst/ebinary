// Browser-only entry point for tests
// This file excludes Mocha imports to avoid browserify issues

// Import all test files
import './numbers/bigint.spec';
import './numbers/float.spec';
import './numbers/int.spec';
import './numbers/varint.spec';
import './string/native.spec';
import './string/string.spec';
import './aligned.spec';
import './array.spec';
import './bool.spec';
import './buffer.spec';
import './const.spec';
import './enum.spec';
import './low_cardinality.spec';
import './oneof.spec';
import './optional.spec';
import './struct.spec';
import './transform.spec';

// Browser-specific setup
if (typeof window !== 'undefined') {
    console.log('Browser tests loaded');
    
    // Wait for Mocha to be loaded from CDN
    const waitForMocha = () => {
        if (typeof (window as any).mocha !== 'undefined') {
            (window as any).mocha.setup('bdd');
            console.log('Mocha configured for browser');
        } else {
            setTimeout(waitForMocha, 100);
        }
    };
    waitForMocha();
}
