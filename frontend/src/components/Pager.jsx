/** Previous / next controls for any paged list from the API. */
export default function Pager({ data, onPage }) {
  if (!data || data.totalPages <= 1) return null
  return (
    <nav className="pager" aria-label="Pages">
      <button type="button" className="btn btn--small btn--ghost" disabled={data.page === 0} onClick={() => onPage(data.page - 1)}>Previous</button>
      <span>Page {data.page + 1} of {data.totalPages}</span>
      <button type="button" className="btn btn--small btn--ghost" disabled={data.last} onClick={() => onPage(data.page + 1)}>Next</button>
    </nav>
  )
}
