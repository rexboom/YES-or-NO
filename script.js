const supabaseUrl = "https://jhminjhsbzcahotvtwql.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpobWluamhzYnpjYWhvdHZ0d3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NDMzMzMsImV4cCI6MjA2NzQxOTMzM30.i7HjdZQpuhbhaIgGePzgAj6f1voVwGlf4fdgCBxLdPI"; // shorten for safety
const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  "Content-Type": "application/json"
};

async function submitQuestion() {
  const input = document.getElementById("question-input");
  const question = input.value.trim();
  if (!question) return alert("Type something!");

  animatePostButton();

  const res = await fetch(`${supabaseUrl}/rest/v1/posts`, {
    method: "POST",
    headers,
    body: JSON.stringify({ question })
  });

  if (!res.ok) return alert("Failed to post.");

  input.value = "";
  loadFeed();
}

async function vote(postId, voteValue) {
  const voted = localStorage.getItem(`voted_${postId}`);
  if (voted) return alert("You already voted on this one!");

  const res = await fetch(`${supabaseUrl}/rest/v1/votes`, {
    method: "POST",
    headers,
    body: JSON.stringify({ post_id: postId, vote: voteValue })
  });

  if (!res.ok) return alert("Vote failed.");

  localStorage.setItem(`voted_${postId}`, voteValue);
  loadFeed();
}

async function loadFeed() {
  const postRes = await fetch(`${supabaseUrl}/rest/v1/posts?select=*&order=created_at.desc`, { headers });
  const posts = await postRes.json();

  const voteRes = await fetch(`${supabaseUrl}/rest/v1/votes?select=*`, { headers });
  const votes = await voteRes.json();

  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  posts.forEach(post => {
    const postVotes = votes.filter(v => v.post_id === post.id);
    const total = postVotes.length;
    const count = {
      yes: postVotes.filter(v => v.vote === 'yes').length,
      no: postVotes.filter(v => v.vote === 'no').length,
      idk: postVotes.filter(v => v.vote === 'idk').length
    };

    const percent = {
      yes: total ? Math.round((count.yes / total) * 100) : 0,
      no: total ? Math.round((count.no / total) * 100) : 0,
      idk: total ? Math.round((count.idk / total) * 100) : 0
    };

    const hasVoted = localStorage.getItem(`voted_${post.id}`);

    const card = document.createElement("div");
    card.className = "bg-white rounded-xl shadow-md p-6 mb-6";

    card.innerHTML = `
      <p class="text-xl font-semibold mb-4">${post.question}</p>
      ${hasVoted ? `
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>✅ Yes</span><span>${percent.yes}%</span>
            </div>
            <div class="vote-bar-container"><div class="vote-bar-fill vote-bar-yes" style="width: ${percent.yes}%"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>❌ No</span><span>${percent.no}%</span>
            </div>
            <div class="vote-bar-container"><div class="vote-bar-fill vote-bar-no" style="width: ${percent.no}%"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>🤷 IDK</span><span>${percent.idk}%</span>
            </div>
            <div class="vote-bar-container"><div class="vote-bar-fill vote-bar-idk" style="width: ${percent.idk}%"></div></div>
          </div>
        </div>
      ` : `
        <div class="flex gap-2">
          <button onclick="vote('${post.id}', 'yes')" class="bg-green-500 text-white px-4 py-2 rounded-full w-full hover:bg-green-600 transition transform hover:scale-105 active:scale-95 shadow">✅ Yes</button>
          <button onclick="vote('${post.id}', 'no')" class="bg-red-500 text-white px-4 py-2 rounded-full w-full hover:bg-red-600 transition transform hover:scale-105 active:scale-95 shadow">❌ No</button>
          <button onclick="vote('${post.id}', 'idk')" class="bg-yellow-400 text-white px-4 py-2 rounded-full w-full hover:bg-yellow-500 transition transform hover:scale-105 active:scale-95 shadow">🤷 IDK</button>
        </div>
      `}`;

    feed.appendChild(card);
  });
}

function animatePostButton() {
  const btn = document.querySelector("button[onclick*='submitQuestion']");
  if (!btn) return;
  btn.classList.add("animate-bounce-post");
  setTimeout(() => btn.classList.remove("animate-bounce-post"), 400);
}

document.getElementById("question-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    submitQuestion();
  }
});

loadFeed();
