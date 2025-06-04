'use client';
import React, { useEffect, useState } from 'react';
import { loadAllIntents } from '@/lib/context/intentData';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Helper to shuffle array
function shuffle<T>(arr: T[]): T[] {
  return arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(a => a[1]);
}

export default function RankIntentsPage() {
  const [allIntents, setAllIntents] = useState<any[]>([]);
  const [ranked, setRanked] = useState<any[]>([]);
  const [nextIdx, setNextIdx] = useState(0);

  useEffect(() => {
    async function fetchIntents() {
      const loaded = await loadAllIntents();
      const shuffled = shuffle(loaded);
      setAllIntents(shuffled);
      setRanked([]); // Start with empty ranked list
      setNextIdx(0);
    }
    fetchIntents();
  }, []);

  function handleDragEnd(result: any) {
    if (!result.destination) return;

    // If we are still adding new intents, the blue card is at the end (index = ranked.length)
    if (nextIdx < allIntents.length) {
      // The draggable list is ranked + [current new intent]
      const items = [...ranked, allIntents[nextIdx]];
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);

      // The blue card (new intent) is always at index items.length-1 unless moved
      // If the blue card is not at the end, we need to know its new position
      // Find the index of the blue card (by intent_id)
      const blueCardIdx = items.findIndex(
        (item) => item.intent_id === allIntents[nextIdx].intent_id
      );
      // The new ranked list is everything except the blue card
      setRanked(items.filter((item) => item.intent_id !== allIntents[nextIdx].intent_id));
      // Store the blue card's new position for insertion on confirm
      setBlueCardPosition(blueCardIdx);
    } else {
      // All intents ranked, allow full reordering
      const items = Array.from(ranked);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);
      setRanked(items);
    }
  }

  // Track where the blue card should be inserted
  const [blueCardPosition, setBlueCardPosition] = useState<number | null>(null);

  function handleAddNextIntent(e: React.FormEvent) {
    e.preventDefault();
    if (nextIdx < allIntents.length) {
      // Insert the blue card at the chosen position (default: end)
      const insertAt =
        blueCardPosition !== null ? blueCardPosition : ranked.length;
      const newRanked = [...ranked];
      newRanked.splice(insertAt, 0, allIntents[nextIdx]);
      setRanked(newRanked);
      setNextIdx(nextIdx + 1);
      setBlueCardPosition(null);
    } else {
      // All intents ranked, save and finish
      const rankedIntentIds = ranked.map((intent) => intent.intent_id);
      localStorage.setItem('rankedIntents', JSON.stringify(rankedIntentIds));
      alert('Thank you! Your ranking has been saved.');
    }
  }

  if (allIntents.length === 0) {
    return <div className="max-w-2xl mx-auto p-8">Loading...</div>;
  }

  // Compose the list for drag-and-drop: ranked + blue card (if any)
  let dragList: any[] = [];
  const safeRanked: any[] = Array.isArray(ranked) ? ranked : [];
  if (nextIdx < allIntents.length) {
    const insertAt = typeof blueCardPosition === "number" && blueCardPosition >= 0 && blueCardPosition <= safeRanked.length
      ? blueCardPosition
      : safeRanked.length;
    dragList = [
      ...safeRanked.slice(0, insertAt),
      allIntents[nextIdx],
      ...safeRanked.slice(insertAt),
    ];
  } else {
    dragList = safeRanked;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Rank Your Listening Intents</h1>
      <p className="mb-4 text-gray-700">
        {nextIdx < allIntents.length
          ? `Place the blue card (new intent) where it fits best in your ranking. Drag it to the correct position, then click "Confirm Position" to lock it in.`
          : 'All intents ranked!'}
      </p>
      <form onSubmit={handleAddNextIntent} autoComplete="off">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="intents">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {dragList.map((intent, idx) => {
                  const isBlue =
                    nextIdx < allIntents.length &&
                    intent.intent_id === allIntents[nextIdx].intent_id;
                  return (
                    <Draggable
                      key={intent.intent_id}
                      draggableId={String(intent.intent_id)}
                      index={idx}
                      isDragDisabled={nextIdx < allIntents.length ? !isBlue : false}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-2 p-4 rounded shadow flex items-center border ${
                            isBlue
                              ? `bg-blue-50 border-blue-400 ${
                                  snapshot.isDragging ? 'bg-blue-100' : ''
                                }`
                              : `bg-white ${snapshot.isDragging ? 'bg-gray-100' : ''}`
                          }`}
                        >
                          <span
                            className={`font-semibold ${
                              isBlue ? 'text-blue-900' : ''
                            }`}
                          >
                            {intent.intent_name}
                          </span>
                          <span
                            className={`ml-2 text-sm ${
                              isBlue ? 'text-blue-700' : 'text-gray-500'
                            }`}
                          >
                            {intent.main_listening_function}
                          </span>
                          {isBlue && (
                            <span className="ml-4 text-blue-600 font-bold">
                              Drag me
                            </span>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button
          type="submit"
          className="mt-6 w-full px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow hover:bg-gray-900 focus:ring-2 focus:ring-gray-800 focus:outline-none transition-all"
        >
          {nextIdx < allIntents.length ? 'Confirm Position' : 'Submit Ranking'}
        </button>
      </form>
      <div className="mt-4 text-center text-gray-500">
        {nextIdx < allIntents.length
          ? `Intent ${nextIdx + 1} of ${allIntents.length}`
          : 'All intents have been ranked.'}
      </div>
    </div>
  );
}
