import React from "react";
import menuList from "../Constant/menuList.json";
import { useState } from "react";
import { saveReceipt } from "../../utils/database";
import { useNavigate } from "react-router-dom";

const Order = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemQuantities, setItemQuantities] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderNumber, setOrderNumber] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [saving, setSaving] = useState(false);

  const formatCurrency = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "₦0";
    return `₦${n.toLocaleString()}`;
  };

  const backhome = () => navigate("/");
  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch (e) {
      // ignore errors removing token from localStorage in older browsers
      console.error("Error removing token:", e);
    }
    navigate("/login");
  };

  const handleMenuSelect = (id) => {
    const allMenus = Object.values(menuList).flat();
    const menu = allMenus.find((m) => m.id === id);
    if (menu) setSelectedCategory(menu);
    else {
      const byCategory = allMenus.find((m) => m.category === id);
      if (byCategory) setSelectedCategory(byCategory);
    }
  };

  const addToOrder = (item) => {
    const quantity = itemQuantities[item] || 0;
    if (quantity <= 0) return;
    // find the item object in the selected category to get its price
    const itemObj = selectedCategory.items.find((i) => i.name === item);
    if (!itemObj) return;
    const priceNum = Number(itemObj.price);
    if (!Number.isFinite(priceNum)) {
      alert("Item price is invalid. Cannot add item.");
      return;
    }
    const newItem = {
      name: item,
      quantity,
      price: priceNum,
      total: priceNum * quantity,
    };

    setOrderItems((prev) => {
      const idx = prev.findIndex((p) => p.name === item);
      if (idx >= 0) {
        const cp = [...prev];
        cp[idx] = newItem;
        return cp;
      }
      return [...prev, newItem];
    });

    setItemQuantities((prev) => ({ ...prev, [item]: 0 }));
  };

  const handleIncrement = (itemName) =>
    setItemQuantities((prev) => ({
      ...prev,
      [itemName]: (prev[itemName] || 0) + 1,
    }));
  const handleDecrement = (itemName) =>
    setItemQuantities((prev) => ({
      ...prev,
      [itemName]: Math.max((prev[itemName] || 0) - 1, 0),
    }));
  const handleRemoveItem = (itemName) =>
    setOrderItems((prev) => prev.filter((i) => i.name !== itemName));

  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  const handleConfirmOrder = async () => {
    if (orderItems.length === 0) return;
    const total = orderItems.reduce((s, it) => s + it.total, 0);
    const receipt = {
      orderNumber,
      date: new Date(),
      items: orderItems,
      total,
      payment: paymentMethod,
    };

    try {
      setSaving(true);
      await saveReceipt(receipt);
      setShowReceipt(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save receipt to server. Showing receipt locally.");
      setShowReceipt(true);
    } finally {
      setSaving(false);
    }
  };

  const handlePrintReceipt = () => window.print();

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 h-screen">
        <div className="flex items-center text-amber-800 md:col-span-1">
          <div className="relative h-[50vh] md:h-full w-full rounded-2xl overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60')] bg-cover bg-top md:bg-center" />
            <div className="absolute inset-0 bg-black/60 md:bg-black/70" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
              <div className="text-center">
                <h1 className="text-3xl font-bold">Order Page</h1>
                <p className="mt-4">Your order is being processed</p>
                <div className="space-y-2">
                  <button
                    onClick={backhome}
                    className="mt-4 w-full px-4 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600"
                  >
                    Home
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col h-screen overflow-hidden">
          <div className="flex justify-center py-6 border-2 rounded-lg m-4">
            <h1>Stay With Us</h1>
          </div>

          <div className="flex-1 overflow-auto m-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-center">
                  <h1>OUR MENU</h1>
                </div>
                <div className="mt-4 p-4 border rounded-lg flex justify-between font-extrabold tracking-wider cursor-pointer bg-pink-600 text-white">
                  {menuList.menuBreakfast.map((menu) => (
                    <button
                      key={menu.id}
                      onClick={() => handleMenuSelect(menu.id)}
                      className="cursor-pointer"
                    >
                      {menu.category}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 border rounded-lg flex justify-between font-extrabold tracking-wider cursor-pointer bg-blue-600 text-white">
                  {menuList.menuLunch &&
                    menuList.menuLunch.map((menu) => (
                      <button
                        key={menu.id}
                        onClick={() => handleMenuSelect(menu.id)}
                        className="cursor-pointer"
                      >
                        {menu.category}
                      </button>
                    ))}
                </div>
                <div className="mt-4 p-4 border rounded-lg flex justify-between font-extrabold tracking-wider cursor-pointer bg-green-600 text-white">
                  {menuList.menuProteins &&
                    menuList.menuProteins.map((menu) => (
                      <button
                        key={menu.id}
                        onClick={() => handleMenuSelect(menu.id)}
                        className="cursor-pointer"
                      >
                        {menu.category}
                      </button>
                    ))}
                </div>
                <div className="mt-4 p-4 border rounded-lg flex justify-between font-extrabold tracking-wider cursor-pointer bg-yellow-600 text-white">
                  {menuList.menuDinner &&
                    menuList.menuDinner.map((menu) => (
                      <button
                        key={menu.id}
                        onClick={() => handleMenuSelect(menu.id)}
                        className="cursor-pointer"
                      >
                        {menu.category}
                      </button>
                    ))}
                </div>
                <div className="mt-4 p-4 border rounded-lg flex justify-between font-extrabold tracking-wider cursor-pointer bg-purple-600 text-white">
                  {menuList.menuPastries &&
                    menuList.menuPastries.map((menu) => (
                      <button
                        key={menu.id}
                        onClick={() => handleMenuSelect(menu.id)}
                        className="cursor-pointer"
                      >
                        {menu.category}
                      </button>
                    ))}
                </div>
                <div className="mt-4 p-4 border rounded-lg flex justify-between font-extrabold tracking-wider cursor-pointer bg-red-600 text-white">
                  {menuList.menuBeverages &&
                    menuList.menuBeverages.map((menu) => (
                      <button
                        key={menu.id}
                        onClick={() => handleMenuSelect(menu.id)}
                        className="cursor-pointer"
                      >
                        {menu.category}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center">
                  <h1>YOUR ORDER DETAILS</h1>
                </div>
                <div className="mt-4 p-4 border rounded-lg h-[400px] flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    {selectedCategory ? (
                      <div>
                        <h2 className="font-bold text-lg mb-4">
                          {selectedCategory.category}
                        </h2>
                        <div className="space-y-2 h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                          {selectedCategory.items.map((it, index) => {
                            const itemName = it.name;
                            const itemPrice = it.price;
                            return (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 hover:bg-gray-100 rounded"
                              >
                                <span>{itemName}</span>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleDecrement(itemName)}
                                      className="px-2 py-1 bg-red-500 text-white rounded-l hover:bg-red-600 focus:outline-none"
                                    >
                                      -
                                    </button>
                                    <span className="px-4 py-1 bg-gray-100">
                                      {itemQuantities[itemName] || 0}
                                    </span>
                                    <button
                                      onClick={() => handleIncrement(itemName)}
                                      className="px-2 py-1 bg-green-500 text-white rounded-r hover:bg-green-600 focus:outline-none"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <span>{formatCurrency(itemPrice)}</span>
                                  <button
                                    onClick={() => addToOrder(itemName)}
                                    className={`px-3 py-1 rounded text-white transition-colors ${
                                      itemQuantities[itemName] > 0
                                        ? "bg-blue-500 hover:bg-blue-600"
                                        : "bg-gray-300 cursor-not-allowed"
                                    }`}
                                    disabled={!itemQuantities[itemName]}
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        Select a category to view menu items
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="m-4 p-4 border rounded-lg bg-white md:sticky md:bottom-0 md:z-20 md:shadow-lg">
            <div className="flex items-center justify-center">
              <h2 className="text-xl font-bold">Order Summary</h2>
            </div>
            <div className="mt-4 space-y-2 h-20 md:h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              {orderItems.length > 0 ? (
                <>
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1 border-b"
                    >
                      <span className="flex-1">{item.name}</span>
                      <span className="px-2">x{item.quantity}</span>
                      <span className="w-24 text-right">
                        {formatCurrency(item.price)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.name)}
                        className="ml-4 p-1 text-red-500 hover:text-red-700 focus:outline-none"
                        title="Remove item"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 font-bold">
                    <span>Total:</span>
                    <span>
                      {formatCurrency(
                        orderItems.reduce((sum, item) => sum + item.total, 0)
                      )}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500">No items in order</p>
              )}
            </div>
            {/* Payment selector */}
            <div className="mt-4">
              <div className="text-sm font-semibold mb-2">Payment Method</div>
              <div className="flex gap-2">
                {[
                  { key: "Cash", label: "Cash" },
                  { key: "Transfer", label: "Transfer" },
                  { key: "POS", label: "POS" },
                ].map((pm) => (
                  <button
                    key={pm.key}
                    type="button"
                    onClick={() => setPaymentMethod(pm.key)}
                    aria-pressed={paymentMethod === pm.key}
                    className={`px-3 py-1 rounded-md border font-medium focus:outline-none ${
                      paymentMethod === pm.key
                        ? "bg-indigo-600 text-white border-indigo-700"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              <div>
                <button
                  onClick={handleConfirmOrder}
                  disabled={saving}
                  className={`mt-4 w-full px-4 py-2 text-white font-bold rounded ${
                    saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {saving ? "Saving..." : "Confirm Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            {/* On-screen receipt (single copy) - hidden when printing */}
            <div id="receipt" className="print:hidden">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">D'FAMILIZ</h2>
                <p className="text-sm text-gray-600">Receipt #{orderNumber}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(new Date())}
                </p>
                <p className="text-sm text-gray-600">
                  Payment: {paymentMethod}
                </p>
              </div>
              <div className="border-t border-b py-4 my-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th>Item</th>
                      <th>Qty</th>
                      <th className="text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.name}</td>
                        <td>{item.quantity}</td>
                        <td className="text-right">
                          {formatCurrency(item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      orderItems.reduce((sum, item) => sum + item.total, 0)
                    )}
                  </span>
                </div>
              </div>
              <div className="text-center mt-6 text-sm text-gray-600">
                <p>Thank you for your order!</p>
                <p>Please visit us again</p>
              </div>
            </div>

            {/* Print-only block: three copies (Customer, Sale, Manager) */}
            <div id="receipt-print" className="hidden print:block">
              {["Customer's Copy", "Sale's Copy", "Manager's Copy"].map(
                (caption, copyIndex) => (
                  <div
                    key={copyIndex}
                    className="mb-6"
                    style={
                      copyIndex < 2
                        ? {
                            pageBreakAfter: "always",
                            WebkitPageBreakAfter: "always",
                          }
                        : {}
                    }
                  >
                    <div className="text-center mb-4">
                      <h3 className="text-sm uppercase tracking-wide text-gray-600">
                        {caption}
                      </h3>
                    </div>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold">D'FAMILIZ</h2>
                      <p className="text-sm text-gray-600">
                        Receipt #{orderNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(new Date())}
                      </p>
                      <p className="text-sm text-gray-600">
                        Payment: {paymentMethod}
                      </p>
                    </div>
                    <div className="border-t border-b py-4 my-4">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left">
                            <th>Item</th>
                            <th>Qty</th>
                            <th className="text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderItems.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{item.name}</td>
                              <td>{item.quantity}</td>
                              <td className="text-right">
                                {formatCurrency(item.price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>
                          {formatCurrency(
                            orderItems.reduce(
                              (sum, item) => sum + item.total,
                              0
                            )
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-center mt-6 text-sm text-gray-600">
                      <p>Thank you for your order!</p>
                      <p>Please visit us again</p>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-6 flex justify-between space-x-4 print:hidden">
              <button
                onClick={() => {
                  setShowReceipt(false);
                  setOrderNumber((p) => p + 1);
                  setOrderItems([]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile fixed Confirm button (visible only on small screens) */}
      {orderItems.length > 0 && (
        <button
          onClick={handleConfirmOrder}
          aria-label="Confirm Order"
          disabled={saving}
          className={`md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-11/12 max-w-md px-4 py-3 text-white font-bold rounded-lg shadow-lg ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {saving ? "Saving..." : "Confirm Order"}
        </button>
      )}
    </div>
  );
};

export default Order;
