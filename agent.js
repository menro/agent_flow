import React, { useState } from 'react';
// If you want to use an alias such as "@" for your src folder, configure it via jsconfig.json or webpack.
// Otherwise, if you need the Alert components, import them using a relative path. For now, they are not used.
// import { Alert, AlertDescription } from './components/ui/alert';

function ObjectiveCard() {
  const [step, setStep] = useState(1);
  const [objectiveName, setObjectiveName] = useState('');
  const [objectiveDescription, setObjectiveDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [tasks, setTasks] = useState({});
  const [showCreatePersona, setShowCreatePersona] = useState(false);
  const [newPersona, setNewPersona] = useState({ name: '', description: '' });
  const [workplan, setWorkplan] = useState(null);

  // Default personas
  const [existingPersonas, setExistingPersonas] = useState([
    { 
      id: 1, 
      name: 'Law Librarian',
      description: 'Specializes in legal research and reference. Has deep knowledge of legal databases and regulatory repositories. Responsibilities: Collects and organizes the 2023 and latest versions of 12 CFR 614.4165. Maintains updated legal materials. Approach: Uses precise search strategies to retrieve authoritative documents. Prioritizes accuracy and completeness.'
    },
    { 
      id: 2, 
      name: 'Legal Analyst',
      description: 'Trained in interpreting and applying federal regulations. Understands statutory language and legislative intent. Responsibilities: Compares different versions of 12 CFR 614.4165 to identify substantive changes. Approach: Provides clear, structured summaries of regulatory shifts. Highlights potential impacts on policy.'
    },
    { 
      id: 3, 
      name: 'Compliance Officer',
      description: "Skilled in corporate governance and ensuring adherence to federal requirements. Responsibilities: Reviews the Legal Analyst's findings. Determines how new or removed rules affect the firm. Approach: Focuses on risk mitigation by analyzing each identified change. Develops strategies to maintain compliance."
    }
  ]);

  const filteredPersonas = existingPersonas.filter(persona =>
    persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    persona.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addPersona = (persona) => {
    if (!selectedPersonas.find(p => p.id === persona.id)) {
      setSelectedPersonas([...selectedPersonas, persona]);
      setTasks(prev => ({
        ...prev,
        [persona.id]: { task: '', expectedResults: '' }
      }));
    }
  };

  const createNewPersona = () => {
    const newId = Math.max(...existingPersonas.map(p => p.id)) + 1;
    const persona = {
      id: newId,
      ...newPersona
    };
    setExistingPersonas([...existingPersonas, persona]);
    addPersona(persona);
    setNewPersona({ name: '', description: '' });
    setShowCreatePersona(false);
  };

  const removePersona = (personaId) => {
    setSelectedPersonas(selectedPersonas.filter(p => p.id !== personaId));
    const newTasks = { ...tasks };
    delete newTasks[personaId];
    setTasks(newTasks);
  };

  const updateTask = (personaId, field, value) => {
    setTasks(prev => ({
      ...prev,
      [personaId]: {
        ...prev[personaId],
        [field]: value
      }
    }));
  };

  const exportData = () => {
    const data = {
      objectiveName,
      objectiveDescription,
      personas: selectedPersonas.map(persona => ({
        ...persona,
        ...tasks[persona.id],
        ...(workplan && workplan.personaPlans
            ? workplan.personaPlans.find(p => p.persona === persona.name) || {}
            : {})
      }))
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    return data;
  };

  const generateWorkplan = () => {
    const personaWorkplans = selectedPersonas.map(persona => {
      const personaTasks = tasks[persona.id];
      let steps = [];
      switch(persona.name) {
        case 'Law Librarian':
          steps = [
            { step: 1, action: 'Access legal databases and repositories', duration: '1 hour' },
            { step: 2, action: 'Retrieve specified regulatory documents', duration: '2 hours' },
            { step: 3, action: 'Organize and catalog findings', duration: '3 hours' },
            { step: 4, action: personaTasks.task, duration: '4 hours' },
            { step: 5, action: `Validate results: ${personaTasks.expectedResults}`, duration: '2 hours' }
          ];
          break;
        case 'Legal Analyst':
          steps = [
            { step: 1, action: 'Review provided documentation', duration: '2 hours' },
            { step: 2, action: 'Analyze regulatory changes', duration: '4 hours' },
            { step: 3, action: 'Draft detailed comparison', duration: '3 hours' },
            { step: 4, action: personaTasks.task, duration: '4 hours' },
            { step: 5, action: `Prepare findings: ${personaTasks.expectedResults}`, duration: '3 hours' }
          ];
          break;
        case 'Compliance Officer':
          steps = [
            { step: 1, action: 'Review analysis documentation', duration: '2 hours' },
            { step: 2, action: 'Identify compliance implications', duration: '3 hours' },
            { step: 3, action: 'Develop mitigation strategies', duration: '4 hours' },
            { step: 4, action: personaTasks.task, duration: '4 hours' },
            { step: 5, action: `Validate outcomes: ${personaTasks.expectedResults}`, duration: '3 hours' }
          ];
          break;
        default:
          steps = [
            { step: 1, action: 'Review assigned task', duration: '1 hour' },
            { step: 2, action: personaTasks.task, duration: '4 hours' },
            { step: 3, action: `Achieve: ${personaTasks.expectedResults}`, duration: '3 hours' }
          ];
      }
      return {
        persona: persona.name,
        description: persona.description,
        task: personaTasks.task,
        expectedResults: personaTasks.expectedResults,
        workplan: steps
      };
    });

    setWorkplan({
      objective: {
        name: objectiveName,
        description: objectiveDescription
      },
      personaPlans: personaWorkplans
    });

    setStep(3);
  };

  const renderCreatePersonaForm = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 p-6">
        <h3 className="text-2xl font-semibold mb-4">New Persona</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Name</label>
            <input
              type="text"
              value={newPersona.name}
              onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Description</label>
            <textarea
              value={newPersona.description}
              onChange={(e) => setNewPersona({ ...newPersona, description: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCreatePersona(false)}
              className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={createNewPersona}
              disabled={!newPersona.name || !newPersona.description}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Objective Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Objective Name</label>
            <input
              type="text"
              value={objectiveName}
              onChange={(e) => setObjectiveName(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your objective..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Objective Description</label>
            <textarea
              value={objectiveDescription}
              onChange={(e) => setObjectiveDescription(e.target.value)}
              rows={3}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your objective..."
            />
          </div>
        </div>
      </section>

      <section className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Personas</h2>
          <button
            onClick={() => setShowCreatePersona(true)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            New Persona
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search personas..."
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Available Personas</h3>
            <div className="space-y-4">
              {filteredPersonas.map(persona => (
                <div key={persona.id} className="p-4 border rounded-lg flex justify-between items-start hover:shadow transition">
                  <div>
                    <h4 className="text-md font-semibold">{persona.name}</h4>
                    <p className="text-sm text-gray-600">{persona.description}</p>
                  </div>
                  <button
                    onClick={() => addPersona(persona)}
                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Selected Personas</h3>
            <div className="space-y-4">
              {selectedPersonas.map(persona => (
                <div key={persona.id} className="p-4 border rounded-lg flex justify-between items-start hover:shadow transition">
                  <div>
                    <h4 className="text-md font-semibold">{persona.name}</h4>
                    <p className="text-sm text-gray-600">{persona.description}</p>
                  </div>
                  <button
                    onClick={() => removePersona(persona.id)}
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => setStep(2)}
          disabled={!objectiveName || selectedPersonas.length === 0}
          className="px-6 py-3 rounded bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Review Objective</h2>
        <p className="text-gray-700 mb-2">{objectiveName}</p>
        <p className="text-gray-600">{objectiveDescription}</p>
      </section>

      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Define Tasks for Personas</h2>
        {selectedPersonas.map(persona => (
          <div key={persona.id} className="mb-6 p-4 border rounded-lg hover:shadow transition">
            <h3 className="text-lg font-medium mb-2">{persona.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{persona.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task</label>
                <input
                  type="text"
                  value={tasks[persona.id]?.task || ''}
                  onChange={(e) => updateTask(persona.id, 'task', e.target.value)}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Results</label>
                <input
                  type="text"
                  value={tasks[persona.id]?.expectedResults || ''}
                  onChange={(e) => updateTask(persona.id, 'expectedResults', e.target.value)}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter expected results..."
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-3 rounded bg-gray-600 text-white hover:bg-gray-700 transition"
        >
          Back
        </button>
        <button
          onClick={generateWorkplan}
          className="px-6 py-3 rounded bg-green-600 text-white hover:bg-green-700 transition"
        >
          Generate Workplan
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-3">
          {workplan && workplan.objective && workplan.objective.name}
        </h2>
        <p className="text-gray-700 mb-3">
          {workplan && workplan.objective && workplan.objective.description}
        </p>
      </section>
      {workplan && workplan.personaPlans && workplan.personaPlans.map((plan, idx) => (
        <section key={idx} className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">{plan.persona}</h3>
            <p className="text-sm text-gray-600">{plan.description}</p>
            <div className="mt-3">
              <div className="text-sm font-medium text-blue-600">Task: {plan.task}</div>
              <div className="text-sm font-medium text-green-600 mt-1">Expected Results: {plan.expectedResults}</div>
            </div>
          </div>
          <div className="space-y-4">
            {plan.workplan.map((stepItem, stepIdx) => (
              <div key={stepIdx} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                    {stepItem.step}
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={stepItem.duration}
                    onChange={(e) => {
                      const newWorkplan = { ...workplan };
                      newWorkplan.personaPlans[idx].workplan[stepIdx].duration = e.target.value;
                      setWorkplan(newWorkplan);
                    }}
                    className="w-24 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={stepItem.action}
                    onChange={(e) => {
                      const newWorkplan = { ...workplan };
                      newWorkplan.personaPlans[idx].workplan[stepIdx].action = e.target.value;
                      setWorkplan(newWorkplan);
                    }}
                    className="w-full mt-2 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[60px]"
                  />
                </div>
              </div>
            ))}
            <div>
              <button
                onClick={() => {
                  const newWorkplan = { ...workplan };
                  newWorkplan.personaPlans[idx].workplan.push({
                    step: plan.workplan.length + 1,
                    action: '',
                    duration: '1 hour'
                  });
                  setWorkplan(newWorkplan);
                }}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Add Step
              </button>
            </div>
          </div>
        </section>
      ))}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-3 rounded bg-gray-600 text-white hover:bg-gray-700 transition"
        >
          Back
        </button>
        <button
          onClick={exportData}
          className="px-6 py-3 rounded bg-green-600 text-white hover:bg-green-700 transition"
        >
          Export Data
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between mb-6">
        {["Define Objective", "Define Tasks", "AI Workplan"].map((title, index) => (
          <div
            key={index}
            className={`flex-1 text-center p-3 rounded-lg font-medium ${
              step === index + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {title}
          </div>
        ))}
      </div>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {showCreatePersona && renderCreatePersonaForm()}
    </div>
  );
}

export default ObjectiveCard;
