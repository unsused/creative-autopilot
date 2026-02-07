# Creative Autopilot 🚀

**Creative Autopilot** is an autonomous creative agent designed to transform raw brand ideas into cohesive visual identities and marketing assets. Powered by Google's **Gemini 3** and **Nano Banana Pro** models, it acts as an AI Creative Director that plans, designs, and executes creative campaigns automatically.

## ✨ Features

- **Autonomous Brand Strategy**: Analyzes a simple text prompt to determine brand personality, color palettes, and target audiences.
- **Multi-Modal Asset Generation**:
  - **Logos**: High-fidelity brand marks.
  - **Social Media Posts**: Instagram-ready visuals with accompanying copy.
  - **Storyboard Frames**: Cinematic concepts for video commercials.
  - **Copywriting**: Catchy taglines and slogans.
- **Cloud Sync**: Save, load, and manage campaigns using Supabase.
- **Real-time Agent Feedback**: Watch the agent "think" via a terminal-style log as it iterates through planning and generation.

## 🤖 AI Models Used

This project utilizes the `@google/genai` SDK:

1.  **Gemini 3 Flash (`gemini-3-flash-preview`)**: Used for the "Brain." It handles complex reasoning, JSON structure generation, brand analysis, and copywriting.
2.  **Nano Banana Pro (`gemini-3-pro-image-preview`)**: Used for the "Brush." High-fidelity image generation for logos and visuals.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS
- **State/Auth**: Supabase (Database & Authentication)
- **AI SDK**: Google GenAI SDK

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Cloud Project with the Gemini API enabled (or AI Studio key).
- A Supabase project.

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd creative-autopilot
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:

    ```env
    # Note: The app can ask for the Google API Key via UI if using AI Studio.
    # Otherwise, inject it here:
    VITE_GEMINI_API_KEY=your_google_api_key

    # Model configuration (override if needed)
    VITE_GEMINI_PLAN_MODEL=gemini-3-pro-preview
    VITE_GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview

    # Supabase Configuration
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup (Supabase)**
    Run the following SQL in your Supabase SQL Editor to create the necessary table:

    ```sql
    create table campaigns (
      id uuid default gen_random_uuid() primary key,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      user_id uuid references auth.users not null,
      name text,
      brand_name text,
      plan_data jsonb,
      assets_data jsonb
    );
    
    -- Enable Row Level Security (RLS)
    alter table campaigns enable row level security;
    
    -- Create Policies
    create policy "Users can view their own campaigns" on campaigns
      for select using (auth.uid() = user_id);
      
    create policy "Users can insert their own campaigns" on campaigns
      for insert with check (auth.uid() = user_id);

    create policy "Users can delete their own campaigns" on campaigns
      for delete using (auth.uid() = user_id);
    ```

### Running the App

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📝 Usage Guide

1.  **Connect API Key**: Click "Connect API Key" to securely authorize with Google AI Studio.
2.  **Login (Optional)**: Sign up/Login to enable cloud saving features.
3.  **Enter Prompt**: Describe your business idea (e.g., *"A cyber-noir noodle bar in Tokyo 2077"*).
4.  **Initialize**: The agent will analyze the brand and propose a plan.
5.  **Generate**: Approve the plan to start generating assets.
6.  **Save**: Persist your campaign to the database.

## 📄 License

MIT
