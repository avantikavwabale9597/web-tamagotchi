const bgThemes = {
  lavendar:
    "radial-gradient(circle at top, #f3e5f5, #d1c4e9 40%, #9575cd 100%)",
  sunset: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
  mint: "linear-gradient(135deg, #a8edea, #fed6e3)",
  dark: "linear-gradient(135deg, #232526, #414345)",
};
const deviceThemes = {
  purple: {
    device: "linear-gradient(180deg, #0f0f12 0%, #1a1a1f 30%, #7b1fa2 100%)",
    light: "#e1bee7",
    dark: "#ce93d8",
  },
  pink: {
    device: "linear-gradient(180deg, #2a0f1f 0%, #4a1a3a 30%, #ec407a 100%)",
    light: "#f8bbd0",
    dark: "#f48fb1",
  },
  blue: {
    device: "linear-gradient(180deg, #0f1a2a 0%, #1a2f4a 30%, #42a5f5 100%)",
    light: "#bbdefb",
    dark: "#90caf9",
  },
  green: {
    device: "linear-gradient(180deg, #0f2a1a 0%, #1a4a2f 30%, #66bb6a 100%)",
    light: "#c8e6c9",
    dark: "#a5d6a7",
  },
};

document.getElementById("deviceColor").addEventListener("change", (e) => {
  const theme = deviceThemes[e.target.value];

  document.documentElement.style.setProperty("--device-color", theme.device);
  document.documentElement.style.setProperty("--screen-light", theme.light);
  document.documentElement.style.setProperty("--screen-dark", theme.dark);
});

document.getElementById("bgTheme").addEventListener("change", (e) => {
  document.body.style.background = bgThemes[e.target.value];
});
