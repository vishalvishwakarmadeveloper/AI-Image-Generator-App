import { Authenticated, Unauthenticated, useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { useState } from "react";
import { Toaster, toast } from "sonner";

const STYLES = [
  "Photorealistic",
  "Anime",
  "Digital Art",
  "Oil Painting",
  "Watercolor",
  "Pixel Art",
  "3D Render",
  "Minimalist",
];

const SIZES = [
  "1024x1024",
  "1024x1792",
  "1792x1024",
];

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-purple-900 text-white">
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Image Generator
        </h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Content />
        </div>
      </main>
      <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 p-6 text-center">
        <p className="text-gray-400">
          Created by{" "}
          <a
            href="https://www.linkedin.com/in/vishalvishwkarma"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Vishal Vishwakarma
          </a>
          {" • "}
          <a
            href="https://github.com/vishalvishwakarmadeveloper"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            GitHub
          </a>
        </p>
      </footer>
      <Toaster />
    </div>
  );
}

function ApiKeyInstructions() {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4 border border-gray-700">
      <h3 className="text-xl font-semibold text-white">Setup Required: OpenAI API Key</h3>
      <div className="prose prose-sm prose-invert">
        <p>To start generating images, you need to add your OpenAI API key to the project:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">OpenAI API Keys</a></li>
          <li>Create a new API key (or use an existing one)</li>
          <li>Open the "Database" tab in your Convex dashboard</li>
          <li>Click on "Settings" (gear icon)</li>
          <li>Select "Environment variables"</li>
          <li>Add a new variable named <code className="bg-gray-700 px-2 py-1 rounded">OPENAI_API_KEY</code></li>
          <li>Paste your OpenAI API key as the value</li>
          <li>Click "Save"</li>
        </ol>
        <p className="text-sm text-gray-400 mt-4">
          Note: Your API key will be securely stored and only used server-side to generate images.
        </p>
      </div>
    </div>
  );
}

function Content() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [size, setSize] = useState(SIZES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKeyError, setHasApiKeyError] = useState(false);
  
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userImages = useQuery(api.images.getUserImages);
  const generateImage = useAction(api.images.generateImage);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }
    if (!loggedInUser?._id) {
      toast.error("Please sign in first");
      return;
    }

    setIsGenerating(true);
    setHasApiKeyError(false);
    try {
      await generateImage({
        prompt,
        style,
        size,
        userId: loggedInUser._id,
      });
      toast.success("Image generated successfully!");
      setPrompt("");
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("OpenAI API key")) {
        setHasApiKeyError(true);
      }
      toast.error("Failed to generate image: " + errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Turn Words into Art
        </h1>
        <Authenticated>
          <p className="text-xl text-gray-300">
            Welcome back, {loggedInUser?.email ?? "creator"}!
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-gray-300">Sign in to create amazing images</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        <div className="space-y-6">
          {hasApiKeyError && <ApiKeyInstructions />}
          
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4 border border-gray-700">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="w-full h-32 p-4 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-2 bg-gray-700 border-gray-600 text-white rounded-lg"
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Size
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full p-2 bg-gray-700 border-gray-600 text-white rounded-lg"
                >
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium
                hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transform transition
                hover:scale-[1.02] active:scale-[0.98]"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating...
                </span>
              ) : (
                "Generate Image"
              )}
            </button>
          </div>

          {userImages && userImages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Your Creations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userImages.map((image) => (
                  <div
                    key={image._id}
                    className="bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-700"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {image.prompt}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Style: {image.style}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Authenticated>
    </div>
  );
}
