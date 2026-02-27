import { useEffect, useMemo, useState } from "react";
import NavBar from "./NavBar";
import api from "../api/axios";
import "./ViewReports.css";

function ViewReports() {
  const [regionFilter, setRegionFilter] = useState("");
  const [partyFilter, setPartyFilter] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [reportsData, setReportsData] = useState({
    regional_party_support: {},
    overall_leading_party: {
      party: "",
      supporters: 0,
      all_parties: {},
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/users/reports");
        setReportsData(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const regionalPartySupport = reportsData.regional_party_support || {};
  const overallLeading = reportsData.overall_leading_party || null;

  const allRegions = useMemo(() => Object.keys(regionalPartySupport), [regionalPartySupport]);
  const allParties = useMemo(() => {
    const set = new Set();
    Object.values(regionalPartySupport).forEach((regionData) => {
      Object.keys(regionData).forEach((party) => set.add(party));
    });
    return Array.from(set).sort();
  }, [regionalPartySupport]);

  const getLeadingParty = (region) => {
    const parties = regionalPartySupport[region] || {};
    let maxSupport = 0;
    let leadingParty = "";
    Object.entries(parties).forEach(([party, data]) => {
      if (data.supporters > maxSupport) {
        maxSupport = data.supporters;
        leadingParty = party;
      }
    });
    return { party: leadingParty, supporters: maxSupport };
  };

  const filteredRegions = regionFilter ? [regionFilter] : allRegions;

  return (
    <div className="view-reports-page">
      <NavBar />
      <div className="view-reports">
        <h3>Regional Party Support & Voter Feedback</h3>

        {loading && <div className="no-data"><p>Loading reports...</p></div>}
        {error && <div className="no-data"><p>{error}</p></div>}

        {!loading && !error && Object.keys(regionalPartySupport).length === 0 && (
          <div className="no-data">
            <p>No feedback data available. Submit survey data first.</p>
          </div>
        )}

        {!loading && !error && Object.keys(regionalPartySupport).length > 0 && (
          <>
            {overallLeading && overallLeading.party && (
              <div className="overall-leading">
                <h2>Overall Leading Party Across All Regions</h2>
                <div className="overall-winner">
                  <span className="winner-party">{overallLeading.party}</span>
                  <span className="winner-count">{overallLeading.supporters} Total Supporters</span>
                </div>
                <div className="all-parties-summary">
                  {Object.entries(overallLeading.all_parties || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([party, supporters]) => (
                      <div key={party} className="party-summary-item">
                        <span className="party-name">{party}:</span>
                        <span className="party-supporters">{supporters} supporters</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="filters">
              <select
                className="filter-select"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="">All Regions</option>
                {allRegions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>

              <select
                className="filter-select"
                value={partyFilter}
                onChange={(e) => setPartyFilter(e.target.value)}
              >
                <option value="">All Parties</option>
                {allParties.map((party) => (
                  <option key={party} value={party}>{party}</option>
                ))}
              </select>

              <select
                className="filter-select"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <option value="all">Show All Parties</option>
                <option value="winning">Show Winning Party Only</option>
              </select>
            </div>

            {filteredRegions.map((region) => {
              const leading = getLeadingParty(region);
              const availableParties = Object.keys(regionalPartySupport[region] || {});
              const partiesToShow = viewMode === "winning"
                ? (leading.party ? [leading.party] : [])
                : availableParties.filter((party) => !partyFilter || party === partyFilter);

              if (partiesToShow.length === 0) return null;

              return (
                <div key={region} className="region-section">
                  <h2 className="region-title">{region} Region</h2>
                  <div className="leading-party">
                    <strong>{viewMode === "winning" ? "Winning Party:" : "Leading Party:"}</strong> {leading.party} with {leading.supporters} supporters
                  </div>

                  <div className="party-grid">
                    {partiesToShow.map((party) => {
                      const data = regionalPartySupport[region][party];
                      return (
                        <div key={party} className="party-support-card">
                          <div className="party-header">
                            <h3>{party}</h3>
                            <div className="supporters-count">{data.supporters} Supporters</div>
                          </div>

                          <div className="blo-attendance">
                            <strong>BLOs Attended:</strong>
                            <div className="blo-tags">
                              {data.blos.map((bloName) => (
                                <span key={bloName} className="blo-tag">{bloName}</span>
                              ))}
                            </div>
                          </div>

                          <div className="voter-feedbacks">
                            <strong>Voter Feedback:</strong>
                            {data.feedbacks.length > 0 ? data.feedbacks.map((fb, idx) => (
                              <div key={idx} className="feedback-item">
                                <div className="feedback-header">
                                  <span className={`sentiment ${(fb.sentiment || "neutral").toLowerCase()}`}>
                                    {(fb.sentiment || "neutral").toUpperCase()}
                                  </span>
                                  <span className="feedback-supporters">{fb.supporters} voter</span>
                                </div>
                                <p className="feedback-text">{fb.feedback}</p>
                              </div>
                            )) : <p className="feedback-text">No textual feedback available.</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default ViewReports;
