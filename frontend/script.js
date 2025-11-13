let moodChart;

async function submitMood() {
    const username = document.getElementById('username').value.trim();
    const mood = document.getElementById('mood').value.trim();

    if (!username || !mood) {
        alert('Please enter both username and mood.');
        return;
    }


    document.getElementById("quote").textContent = "Saving your mood...";

    try {
        const response = await fetch(`/data?username=${encodeURIComponent(username)}&mood=${encodeURIComponent(mood)}`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        console.log('Received mood from server:", result);')

        document.getElementById("mood").value = "";

        await renderChart(result, username);

    } catch (error) {
        console.error('Error submitting mood:', error);
        document.getElementById("quote").textContent = "There was an error submitting your mood.";
    }
}

async function renderChart(data, username) {
    if (!data.moods || data.moods.length === 0) {
        document.getElementById("quote").textContent = "No mood data yet — start tracking!";
        return;
    }

    const moods = data.moods.map(entry => entry.mood);
    const dates = data.moods.map(entry => entry.date);

    document.getElementById("output").innerHTML = `
        <h3>Hi ${username}</h3>
        <p>Here are your moods so far: ${moods.join(", ")}</p>
    `;

    const ctx = document.getElementById("moodChart").getContext("2d");

    if (moodChart) {
        moodChart.destroy();
    }

    const moodScale = { happy: 5, excited: 4, neutral: 3, tired: 2, stressed: 1 };
    const reverseScale = { 1: "stressed", 2: "tired", 3: "neutral", 4: "excited", 5: "happy" };

    moodChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: `${username}'s Mood Tracker`,
                data: moods.map(mood => moodScale[mood] || 3),
                backgroundColor: "#ffc7daff",
                borderColor: "#c48692ff",
                borderWidth: 0.5,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        callback: (value) => reverseScale[value] || value
                    }
                }
            }
        }
    });

    const quotes = [
        "Yesssss. - Probably Phya",
        "What? - James Lusk",
        "That's what's up. - Alex Alvarez",
        "I think you're pretty swaggy. - Phya Williams",
        "You're so pretty. - Litzi Luna"
    ];

    document.getElementById("quote").textContent =
        quotes[Math.floor(Math.random() * quotes.length)];
}



async function loadData(username = null) {
    if (!username) {
        username = document.getElementById("username").value.trim();
        if (!username) return;
    }

    try {
        const res = await fetch(`/data?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        console.log("Loaded data:", data);
        await renderChart(data, username);
    } catch (err) {
        console.error("Error loading data:", err);
    }
}

document.getElementById("submit").addEventListener("click", submitMood);
window.onload = () => loadData();