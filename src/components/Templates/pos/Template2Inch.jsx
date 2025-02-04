import React from "react";
import { forwardRef } from "react";

function Template2Inch() {
  return (
    <div className="w-[192px] mx-auto border p-4">
      <div className="text-center">
        <h2 className="font-bold text-sm">President Thai Restaurant</h2>
        <p className="text-xs">
          498 S. Rosemead Blvd.
          <br />
          Petaluma, CA 94952
          <br />
          (626) 578-9814
        </p>
        <p className="mt-2 text-xs font-semibold">Delivery</p>
      </div>

      <div className="mt-2 text-left text-xs">
        <p className="flex justify-between">
          <span className="font-semibold">Server:</span> <span>JEFF</span>
        </p>
        <hr className="my-2 border-t border-dashed" />
        <p className="flex justify-between">
          <span className="font-semibold">Station:</span> <span>6</span>
        </p>
        <p className="flex justify-between">
          <span className="font-semibold">Order #:</span> <span>21</span>
        </p>
        <p className="flex justify-between">
          <span className="font-semibold">Delivery</span> <span></span>
        </p>
        <p>(818) 951-0000</p>
        <p>10142 Samoa Ave, Petaluma</p>
      </div>

      <hr className="my-2 border-t border-dashed" />
      <p className="text-center font-bold text-xs">
        &gt;&gt; ORDER SETTLED &lt;&lt;
      </p>
      <hr className="my-2 border-t border-dashed" />

      <div className="mt-2 text-xs">
        <p className="flex justify-between">
          <span>1 CAESAR SALAD</span> <span>$5.50</span>
        </p>
        <p className="flex justify-between">
          <span>1 CAESAR CHICKEN SALAD</span> <span>$7.00</span>
        </p>
        <p className="flex justify-between">
          <span>1 Spaghetti Dinner</span> <span>$7.00</span>
        </p>
        <p className="flex justify-between">
          <span>1 SUB -HAM / CHEESE (S)</span> <span>$4.50</span>
        </p>
        <p className="flex justify-between">
          <span>1 Large Cheese (1)</span> <span>$14.50</span>
        </p>
        <div className="ml-4">
          <p>&gt; Pepperoni (1)</p>
          <p>&gt; Sausage (1)</p>
          <p>&gt; Mushrooms (1)</p>
          <p>&gt; Chicken (1)</p>
        </div>
      </div>

      <hr className="my-2 border-t border-dashed" />
      <div className="text-xs">
        <p className="flex justify-between">
          <span>SUB TOTAL:</span> <span>$38.50</span>
        </p>
        <p className="flex justify-between">
          <span>SALES TAX:</span> <span>$2.98</span>
        </p>
        <p className="flex justify-between font-bold">
          <span>AMOUNT DUE:</span> <span>$41.48</span>
        </p>
        <p className="flex justify-between">
          <span>Cash TEND:</span> <span>$45.00</span>
        </p>
        <p className="flex justify-between">
          <span>CHANGE:</span> <span>$3.52</span>
        </p>
      </div>
      <hr className="my-2 border-t border-dashed" />

      <div className="text-center text-xs">
        <p>Ticket #: 2</p>
        <p>NEW: 11/20/2005 9:27:30 PM</p>
        <p>SETTLED: 11/20/2005 9:28:31 PM</p>
        <p className="mt-2 font-bold">THANK YOU!</p>
      </div>
    </div>
  );
}

export default Template2Inch;
