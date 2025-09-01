const Table = ({ headers, rows }) => {
  return (
    <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
      <table className="min-w-full text-sm text-left text-gray-700">
        {/* Table Header */}
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-5 py-3 font-semibold uppercase tracking-wide text-gray-600 border-b"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className={`${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-purple-50 transition-colors`}
            >
              {row.map((cell, i) => (
                <td
                  key={i}
                  className="px-5 py-3 text-gray-700 border-b whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
