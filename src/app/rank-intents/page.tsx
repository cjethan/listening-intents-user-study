'use client';

import React, { useEffect, useState } from 'react';
import { loadAllIntents } from '@/lib/context/intentData';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useRouter } from 'next/navigation';

export default function RankIntentsPage() {
  const [allIntents, setAllIntents] = useState<any[]>([]);
  const [unranked, setUnranked] = useState<any[]>([]);
  const [ranked, setRanked] = useState<any[]>([]);
  const [discarded, setDiscarded] = useState<any[]>([]);
  const [discardFull, setDiscardFull] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchIntents() {
      const loaded = await loadAllIntents();
      setAllIntents(loaded);
      setUnranked(loaded);
      setRanked([]);
      setDiscarded([]);
    }
    fetchIntents();
  }, []);

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    // Prevent dropping into discarded if already 20 items
    if (
      result.destination.droppableId === 'discarded' &&
      discarded.length >= 20 &&
      !(result.source.droppableId === 'discarded')
    ) {
      setDiscardFull(true);
      setTimeout(() => setDiscardFull(false), 2500);
      return;
    }

    if (result.source.droppableId === 'unranked' && result.destination.droppableId === 'ranked') {
      const item = unranked[result.source.index];
      const newUnranked = Array.from(unranked);
      newUnranked.splice(result.source.index, 1);
      const newRanked = Array.from(ranked);
      newRanked.splice(result.destination.index, 0, item);
      setUnranked(newUnranked);
      setRanked(newRanked);
    }
    else if (result.source.droppableId === 'unranked' && result.destination.droppableId === 'discarded') {
      if (discarded.length >= 20) return;
      const item = unranked[result.source.index];
      const newUnranked = Array.from(unranked);
      newUnranked.splice(result.source.index, 1);
      const newDiscarded = Array.from(discarded);
      newDiscarded.splice(result.destination.index, 0, item);
      setUnranked(newUnranked);
      setDiscarded(newDiscarded);
    }
    else if (result.source.droppableId === 'ranked' && result.destination.droppableId === 'ranked') {
      const newRanked = Array.from(ranked);
      const [removed] = newRanked.splice(result.source.index, 1);
      newRanked.splice(result.destination.index, 0, removed);
      setRanked(newRanked);
    }
    else if (result.source.droppableId === 'ranked' && result.destination.droppableId === 'unranked') {
      const item = ranked[result.source.index];
      const newRanked = Array.from(ranked);
      newRanked.splice(result.source.index, 1);
      const newUnranked = Array.from(unranked);
      newUnranked.splice(result.destination.index, 0, item);
      setRanked(newRanked);
      setUnranked(newUnranked);
    }
    else if (result.source.droppableId === 'ranked' && result.destination.droppableId === 'discarded') {
      if (discarded.length >= 20) return;
      const item = ranked[result.source.index];
      const newRanked = Array.from(ranked);
      newRanked.splice(result.source.index, 1);
      const newDiscarded = Array.from(discarded);
      newDiscarded.splice(result.destination.index, 0, item);
      setRanked(newRanked);
      setDiscarded(newDiscarded);
    }
    else if (result.source.droppableId === 'discarded' && result.destination.droppableId === 'ranked') {
      const item = discarded[result.source.index];
      const newDiscarded = Array.from(discarded);
      newDiscarded.splice(result.source.index, 1);
      const newRanked = Array.from(ranked);
      newRanked.splice(result.destination.index, 0, item);
      setDiscarded(newDiscarded);
      setRanked(newRanked);
    }
    else if (result.source.droppableId === 'discarded' && result.destination.droppableId === 'unranked') {
      const item = discarded[result.source.index];
      const newDiscarded = Array.from(discarded);
      newDiscarded.splice(result.source.index, 1);
      const newUnranked = Array.from(unranked);
      newUnranked.splice(result.destination.index, 0, item);
      setDiscarded(newDiscarded);
      setUnranked(newUnranked);
    }
    else if (result.source.droppableId === 'discarded' && result.destination.droppableId === 'discarded') {
      const newDiscarded = Array.from(discarded);
      const [removed] = newDiscarded.splice(result.source.index, 1);
      newDiscarded.splice(result.destination.index, 0, removed);
      setDiscarded(newDiscarded);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (ranked.length < 10) {
      setDiscardFull(true); // Reuse discardFull for error display, or create a new error state if you prefer
      setTimeout(() => setDiscardFull(false), 2500);
      return;
    }
    const rankedIntentIds = ranked.map((intent) => intent.intent_id);
    const discardedIntentIds = discarded.map((intent) => intent.intent_id);
    localStorage.setItem('rankedIntents', JSON.stringify(rankedIntentIds));
    localStorage.setItem('discardedIntents', JSON.stringify(discardedIntentIds));
    router.push('/'); // Redirect to the main page
  }

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 via-white to-blue-50 flex flex-col items-center justify-start py-12 px-2 font-sf">
        <div className="w-full max-w-6xl">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">Rank Your Music Listening Intents</h1>
          <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
            <h2 className="text-lg font-bold mb-2 text-blue-800">Instructions:</h2>
            <p className="mb-2 text-blue-900">
              The goal of this study is to understand why you choose certain music in different situations. We refer to these reasons as <b>music listening intents</b>. A music listening intent is the purpose or motivation behind why you listen to music at a particular moment. Each intent has a name and includes additional details that explain its purpose.</p>
              <p className="mb-2 text-blue-900">On this page, you will see a list of different music listening intents. Please <b>rank these intents</b> according to how important or relevant they are for your own music listening habits.
            </p>
            <div className="mb-2 text-blue-900">
              <strong>How to use this page:</strong><br />
              <ul className="list-disc pl-5">
                <li>
                  <b>All Intents:</b> On the left, you see all possible listening intents. These are unranked at the start.
                </li>
                <li>
                  <b>Your Ranking:</b> Drag and drop the intents that are most relevant to you into the &quot;Your Ranking&quot; box in the order of importance for your listening behavior (top = most important).
                </li>
                <li>
                  <b>Not Relevant:</b> If there are intents that do not apply to you at all, you may drag them into the &quot;Not relevant for me&quot; box at the bottom for better organization or you can just leave them in the box on the left. You can discard up to 20 intents.
                </li>
                <li>
                  You can reorder intents within each box or move them back and forth as needed.
                </li>
                <li>
                  Please rank <b>10 intents</b> before continuing, your top 10 intents will be used in the next steps.
                </li>
              </ul>
            </div>
            <p className="text-blue-900">
              When you are satisfied with your ranking, click <b>Submit Ranking</b> to continue.<br />
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-8">
                {/* Unranked Intents */}
                <Droppable droppableId="unranked">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 bg-gradient-to-br from-white via-gray-50 to-blue-100 rounded-2xl shadow-xl border border-gray-200 p-6 max-h-[600px] overflow-y-auto min-w-[260px] transition-all"
                    >
                      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 tracking-tight font-sf">All Intents</h2>
                      {unranked.length === 0 && (
                        <div className="text-gray-300 text-center py-8">All intents ranked or discarded</div>
                      )}
                      {unranked.map((intent, idx) => (
                        <Draggable key={intent.intent_id} draggableId={`unranked-${intent.intent_id}`} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-2 p-3 bg-white rounded shadow-md flex flex-col cursor-pointer ${
                                snapshot.isDragging ? 'bg-blue-50 shadow-2xl' : ''
                              }`}
                            >
                              <span className="font-semibold">{intent.title_new}</span>
                              <span className="text-gray-500 text-xs">{intent.main_listening_function}</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                {/* Ranked Intents */}
                <Droppable droppableId="ranked">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 rounded-2xl shadow-xl border-2 border-emerald-400 p-6 max-h-[600px] overflow-y-auto min-w-[260px] transition-all"
                    >
                      <h2 className="text-xl font-semibold mb-4 text-center text-emerald-700 tracking-tight font-sf">Your Ranking</h2>
                      {ranked.length === 0 && (
                        <div className="text-gray-300 text-center py-8">Drag intents here to rank</div>
                      )}
                      {ranked.map((intent, idx) => (
                        <Draggable key={intent.intent_id} draggableId={`ranked-${intent.intent_id}`} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-2 p-3 bg-white rounded shadow-md flex flex-col cursor-pointer ${
                                snapshot.isDragging ? 'bg-green-50' : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <span className="text-xs text-gray-400 mr-2 font-bold" style={{ minWidth: 18, textAlign: 'right' }}>
                                  {idx + 1}.
                                </span>
                                <span className="font-semibold">{intent.title_new}</span>
                              </div>
                              <span className="text-gray-500 text-xs">{intent.main_listening_function}</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
              {/* Discarded Intents */}
              <div className="flex justify-center mt-10">
                <Droppable droppableId="discarded" direction="horizontal">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="w-full max-w-4xl min-h-[80px] bg-gradient-to-r from-gray-100 via-gray-50 to-gray-200 border border-gray-300 rounded-xl shadow-inner p-3 flex flex-wrap gap-2 items-start mt-2"
                      style={{ opacity: 0.6, background: 'rgba(245,245,245,0.7)' }}
                    >
                      <span className="block w-full text-center text-xs text-gray-400 mb-2 font-medium tracking-wide font-sf">
                        Not relevant for me {discarded.length >= 20 && <span className="text-red-500 font-bold"> (Box full)</span>}
                      </span>
                      {discarded.map((intent, idx) => (
                        <Draggable key={intent.intent_id} draggableId={`discarded-${intent.intent_id}`} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-2 bg-gray-200 rounded shadow-md border text-xs flex flex-col cursor-pointer ${
                                snapshot.isDragging ? 'bg-gray-300' : ''
                              }`}
                            >
                              <span className="font-semibold">{intent.title_new}</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
            {discardFull && (
              <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg text-center z-50">
                {ranked.length < 10
                  ? 'Please rank at least 10 intents before continuing.'
                  : 'The "Not relevant" box is full (max 20).'}
              </div>
            )}
            <button
              type="submit"
              className="mt-10 max-w-md mx-auto block px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-800 text-white font-semibold rounded-2xl shadow-lg hover:from-gray-600 hover:to-gray-600 hover:shadow-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all text-lg tracking-wide font-sf"
              disabled={ranked.length === 0}
            >
              Submit Ranking
            </button>
          </form>
        </div>
        <style jsx global>{`
          body {
            font-family: 'SF Pro Display', 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            background: #f8fafc;
          }
          .font-sf {
            font-family: 'SF Pro Display', 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          }
        `}</style>
      </div>
    </>
  );
}