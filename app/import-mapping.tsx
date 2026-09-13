import { csvFieldLabels, type CsvInspection } from "@/lib/csv";

export default function ImportMapping({
  inspection,
}: {
  inspection: CsvInspection;
}) {
  return (
    <>
      {inspection.ignored.length > 0 && (
        <p className="message">
          Columns excluded from import: {inspection.ignored.join(", ")}
        </p>
      )}
      <h3>Column mapping</h3>
      <p className="muted">
        Recognized column names map to the fields below. Person and project
        relationships use exact IDs.
      </p>
      <table className="import-mapping">
        <thead>
          <tr>
            <th>Source column</th>
            <th>Periscope field</th>
          </tr>
        </thead>
        <tbody>
          {inspection.columns.map((c) => (
            <tr key={c.target}>
              <td>{c.source}</td>
              <td>{csvFieldLabels[c.target] || c.target}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {inspection.conversions.length > 0 && (
        <>
          <h3>Label mapping</h3>
          <p className="muted">
            Recognized labels are converted to the following stored values.
          </p>
          <table className="import-mapping">
            <thead>
              <tr>
                <th>Field</th>
                <th>Source label</th>
                <th>Stored value</th>
              </tr>
            </thead>
            <tbody>
              {inspection.conversions.map((c) => (
                <tr key={`${c.field}:${c.from}`}>
                  <td>{csvFieldLabels[c.field]}</td>
                  <td>{c.from}</td>
                  <td>{c.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <h3>Record preview</h3>
      <table className="import-mapping">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {inspection.rows.slice(0, 5).map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">
        Showing the first {Math.min(5, inspection.rows.length)} records. All{" "}
        {inspection.rows.length} records will be imported.
      </p>
    </>
  );
}
