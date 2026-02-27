import { createContext, useState, useContext } from 'react';

const BLOContext = createContext();

export const useBLO = () => useContext(BLOContext);

export const BLOProvider = ({ children }) => {
  const [admin, setAdmin] = useState({ name: "Admin User", email: "admin@election.com" });
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [bloList, setBloList] = useState([
    {
      name: "Ramesh Kumar",
      phone: "9876543210",
      email: "ramesh@example.com",
      region: "East",
      feedback: [
        { party: "Party A", supporters: 450, sentiment: "Positive", feedback: "Strong support for development initiatives" },
        { party: "Party B", supporters: 320, sentiment: "Neutral", feedback: "Concerns about infrastructure" },
        { party: "Party C", supporters: 280, sentiment: "Positive", feedback: "Good response to welfare schemes" },
        { party: "Party D", supporters: 190, sentiment: "Negative", feedback: "Lack of employment opportunities" }
      ]
    },
    {
      name: "Suresh Patel",
      phone: "9876543211",
      email: "suresh@example.com",
      region: "West",
      feedback: [
        { party: "Party A", supporters: 380, sentiment: "Positive", feedback: "Appreciate healthcare programs" },
        { party: "Party B", supporters: 420, sentiment: "Positive", feedback: "Strong support for education reforms" },
        { party: "Party C", supporters: 290, sentiment: "Negative", feedback: "Disappointed with employment schemes" },
        { party: "Party D", supporters: 310, sentiment: "Neutral", feedback: "Mixed opinions on infrastructure" }
      ]
    },
    {
      name: "Priya Sharma",
      phone: "9876543212",
      email: "priya@example.com",
      region: "North",
      feedback: [
        { party: "Party A", supporters: 340, sentiment: "Neutral", feedback: "Moderate support for policies" },
        { party: "Party B", supporters: 520, sentiment: "Positive", feedback: "Education reforms are well received" },
        { party: "Party C", supporters: 410, sentiment: "Neutral", feedback: "Mixed opinions on agricultural policies" },
        { party: "Party D", supporters: 270, sentiment: "Positive", feedback: "Appreciate rural development programs" }
      ]
    },
    {
      name: "Anil Verma",
      phone: "9876543213",
      email: "anil@example.com",
      region: "South",
      feedback: [
        { party: "Party A", supporters: 600, sentiment: "Positive", feedback: "Strong backing for industrial growth" },
        { party: "Party B", supporters: 350, sentiment: "Positive", feedback: "Support for women empowerment programs" },
        { party: "Party C", supporters: 480, sentiment: "Positive", feedback: "Excellent healthcare initiatives" },
        { party: "Party D", supporters: 390, sentiment: "Neutral", feedback: "Concerns about environmental policies" }
      ]
    }
  ]);
  const [activities, setActivities] = useState([
    { type: 'create', blo: 'Ramesh Kumar', timestamp: Date.now() - 86400000 },
    { type: 'assign', blo: 'Ramesh Kumar', region: 'East', timestamp: Date.now() - 82800000 },
    { type: 'report', blo: 'Ramesh Kumar', party: 'Party A', timestamp: Date.now() - 79200000 },
    { type: 'create', blo: 'Suresh Patel', timestamp: Date.now() - 75600000 },
    { type: 'assign', blo: 'Suresh Patel', region: 'West', timestamp: Date.now() - 72000000 }
  ]);

  const addBLO = (blo) => {
    setBloList([...bloList, { ...blo, region: "", feedback: [] }]);
    setActivities([...activities, { type: 'create', blo: blo.name, timestamp: Date.now() }]);
  };

  const assignRegion = (bloName, region) => {
    setBloList(bloList.map(blo => 
      blo.name === bloName ? { ...blo, region } : blo
    ));
    setActivities([...activities, { type: 'assign', blo: bloName, region, timestamp: Date.now() }]);
  };

  const bulkAssignRegion = (region, bloNames) => {
    setBloList(bloList.map(blo => 
      bloNames.includes(blo.name) ? { ...blo, region } : blo
    ));
  };

  const addFeedback = (bloName, feedbackData) => {
    setBloList(bloList.map(blo => 
      blo.name === bloName ? { ...blo, feedback: [...(blo.feedback || []), feedbackData] } : blo
    ));
    setActivities([...activities, { type: 'report', blo: bloName, party: feedbackData.party, timestamp: Date.now() }]);
  };

  const deleteBLO = (bloName) => {
    setBloList(bloList.filter(blo => blo.name !== bloName));
    setActivities([...activities, { type: 'delete', blo: bloName, timestamp: Date.now() }]);
  };

  const changePassword = (oldPassword, newPassword) => {
    if (oldPassword !== adminPassword) {
      return { success: false, message: "Incorrect old password" };
    }
    setAdminPassword(newPassword);
    return { success: true, message: "Password changed successfully" };
  };

  return (
    <BLOContext.Provider value={{ admin, bloList, activities, adminPassword, addBLO, assignRegion, bulkAssignRegion, addFeedback, deleteBLO, changePassword }}>
      {children}
    </BLOContext.Provider>
  );
};
