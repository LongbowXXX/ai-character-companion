const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const terraformerPath = path.join(projectRoot, "externals", "terraformer");
const copilotPath = path.join(projectRoot, ".copilot");

function createJunction(target, path) {
  if (fs.existsSync(path)) {
    console.log(`Path already exists: ${path}`);
    return;
  }

  // Ensure parent directory exists
  const parentDir = path.substring(
    0,
    path.lastIndexOf(Object.is(path.lastIndexOf("/"), -1) ? "\\" : "/"),
  );
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  try {
    fs.symlinkSync(target, path, "junction");
    console.log(`Created junction: ${path} -> ${target}`);
  } catch (error) {
    console.error(`Failed to create junction ${path}:`, error.message);
  }
}

// 1. Check if terraformer submodule exists
if (!fs.existsSync(terraformerPath)) {
  console.error("Terraformer submodule not found at:", terraformerPath);
  console.log("Initializing submodule...");
  try {
    execSync("git submodule update --init --recursive", {
      stdio: "inherit",
      cwd: projectRoot,
    });
  } catch (e) {
    console.error(
      'Failed to initialize submodule. Please run "git submodule update --init --recursive" manually.',
    );
    process.exit(1);
  }
}

// 2. Create .copilot directory
if (!fs.existsSync(copilotPath)) {
  fs.mkdirSync(copilotPath);
  console.log("Created .copilot directory");
}

// 3. Create Links
const links = [
  {
    target: path.join(terraformerPath, "knowledge"),
    link: path.join(projectRoot, "knowledge"),
  },
  {
    target: path.join(terraformerPath, ".github", "skills"),
    link: path.join(copilotPath, "skills"),
  },
  {
    target: path.join(terraformerPath, ".github", "prompts"),
    link: path.join(copilotPath, "prompts"),
  },
  {
    target: path.join(terraformerPath, ".github", "agents"),
    link: path.join(copilotPath, "agents"),
  },
];

links.forEach((item) => {
  createJunction(item.target, item.link);
});

console.log("Setup complete!");
