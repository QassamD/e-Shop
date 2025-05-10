import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// import { MouseEvent } from "react";
import { useState } from "react";
function ListGroup({ items, heading, onSelectItem }) {
    //   items = [];
    const [selectedIndex, setSelectedIndex] = useState(-1);
    return (_jsxs(_Fragment, { children: [_jsx("h1", { children: heading }), items.length === 0 && _jsx("p", { children: "No item found" }), _jsx("ul", { className: "list-group", children: items.map((item, index) => (_jsx("li", { className: selectedIndex === index
                        ? "list-group-item active"
                        : "list-group-item", onClick: () => {
                        setSelectedIndex(index);
                        onSelectItem(item);
                    }, children: item }, item))) })] }));
}
export default ListGroup;
