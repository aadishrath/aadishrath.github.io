//  Central place to define all your projects.
//  Only editing this file to add new projects.

export const mlProjects = [
  {
    icon: 'AI',
    title: 'Interactive RAG Assistant',
    description: 'A full-stack retrieval-augmented generation app with document ingest, vector search, grounded citations, and a portfolio-native React UI.',
    repo: 'https://github.com/aadishrath/aadishrath.github.io',
    details: `This project turns the portfolio into an interactive Retrieval-Augmented Generation system that users can actually query. It combines a React 19 frontend with a FastAPI backend, local vector retrieval, and optional OpenAI-powered answer synthesis for higher quality grounded responses.

    ## Project Overview
      Users can load a packaged demo corpus or upload their own markdown, text, and PDF files.
      The backend chunks documents, generates embeddings, builds a FAISS index, retrieves relevant passages, and returns cited answers with retrieval diagnostics.

    ## Resume-Friendly Stack
      - Frontend: React 19, Vite, CSS aligned with the portfolio design
      - Backend: FastAPI, Pydantic, python-multipart
      - Retrieval: sentence-transformers embeddings + FAISS vector search
      - LLM layer: optional OpenAI Responses API fallback

    ## Key Features
      - Corpus upload and demo corpus bootstrap flow
      - Chunked indexing pipeline for markdown, text, and PDF documents
      - Hybrid semantic plus lexical reranking
      - Grounded answers with source previews and retrieval scores
      - Portfolio-native UI instead of a generic admin dashboard

    ## Why it matters
      This project demonstrates the skills employers usually look for in applied AI and ML platform roles: API design, retrieval engineering, UI integration, explainability, and end-to-end product ownership.
    `
  },
  {
    icon: '🏡',
    title: 'House Price Prediction',
    description: 'This project builds and evaluates multiple machine learning models to predict house prices based on various features.',
    repo: 'https://github.com/aadishrath/housePrediction',
    details: `This project builds and evaluates multiple machine learning models to predict house prices based on various features. It includes data preprocessing, feature selection, hyperparameter tuning, and model evaluation. The best performing combination for each model is saved and later used for prediction via React UI.

      - Data preprocessing: cleaning, scaling, and feature selection
      - Model training: using six different regression algorithms
      - Hyperparameter tuning: via GridSearchCV with cross-validation
      - Evaluation: using MAE, MSE, RMSE, and R² Score
      - Model saving: best models, scalers, and selected features are saved for predictions through React UI

    ## 🔍 Models Used
      The following models are trained and tuned:
        - Linear Regression: baseline model with no hyperparameters
        - Decision Tree Regressor (labeled as "Ridge Regression"):
          - max_depth, min_samples_split
        - Random Forest Regressor:
          - n_estimators, max_depth, min_samples_split
        - Support Vector Machine (SVR):
          - C, kernel, gamma
        - XGBoost Regressor:
          - n_estimators, max_depth, learning_rate, subsample
        - Neural Network (MLPRegressor):
          - hidden_layer_sizes, activation, learning_rate_init

      Each model undergoes feature selection using either:
        - Recursive Feature Elimination (RFE) for linear models
        - SelectFromModel for tree-based models

    ## 📁 Project Structure

      ├── README.md             # Project documentation
      ├── house_data.csv        # Input dataset
      ├── requirements.txt      # Project libraries
      ├── train_model.py        # Main training script
      ├── app.py                # Flask script to setup backend for UI
      ├── models/               # Saved models and metadata 
      ├── scalers/              # Saved scalers per model 
      ├── features/             # Selected features and feature order 
      ├── react-ui/             # Interactive UI for user


    ## 🧹 Dropped Features Before Training
      Certain features were dropped prior to model training due to the following reasons:

        | Feature       | Reason for Dropping                                     |
        |---------------|---------------------------------------------------------|
        | id            | Unique identifier; no predictive value                  |
        | date          | Timestamp of sale; not useful without temporal modeling |
        | sqft_basement | Highly correlated with sqft_living and sqft_above       |
        | yr_renovated  | Mostly zeros; sparse and not informative                |

      These features either introduced noise, redundancy, or lacked meaningful variance. Dropping them improved model interpretability and reduced overfitting risk.


    ## 📊 Dataset
      The dataset contains housing features and sale prices. Key input features include:
        - bedrooms, bathrooms, floors, waterfront, view, condition, grade
        - yr_built, lat, long, sqft_living, sqft_lot, zipcode, etc.
        - price (target variable)


    ## 🧠 Models Trained

      | Model             | R² Score | RMSE       | MAE        | Best Parameters |
      |-------------------|----------|------------|------------|-----------------|
      | Linear Regression | 0.634    | 222,106    | 134,890    |        —        |
      | Ridge Regression  | 0.780    | 172,272    | 90,299     | max_depth=10, min_samples_split=20 |
      | Random Forest     | 0.884    | 125,005    | 71,291     | n_estimators=100, max_depth=None, min_samples_split=5 |
      | SVM               | 0.505    | 258,194    | 135,032    | C=10, kernel=linear, gamma=scale |
      | XGBoost           | 0.867    | 133,653    | 71,808     | learning_rate=0.05, max_depth=6, n_estimators=200, subsample=1.0 |
      | Neural Network    | 0.882    | 125,841    | 75,333     | activation=relu, hidden_layer_sizes=(64,64), learning_rate_init=0.005 |


    ## 🏆 Best Performing Model
      Random Forest Regressor

    ## 🛠️ Setup Instructions
      Must follow all steps in order. 3 terminal windows will be used here.
        1. Install Dependencies
        2. Run Training Script
        3. Run Backend Script
        4. Run UI Script
    `
  },
  {
    icon: '😀',
    title: 'Sentiment Analysis Platform',
    description: 'A modular, full-stack sentiment analysis application that demonstrates foundational and advanced NLP techniques.',
    repo: 'https://github.com/aadishrath/sentimentAnalysis',
    details: `A modular, full-stack sentiment analysis application that demonstrates foundational and advanced NLP techniques. Built with a scalable backend, interactive React frontend, and integrated analytics logging, this project is designed for real-world deployment and resume impact.

    ## 🚀 Project Overview
      This platform allows users to input text and receive sentiment predictions using multiple NLP models. 
      It supports emoji-based feedback, tracks user interactions, and logs analytics for model performance and usage trends.

    ## 🔍 Features
      - Multi-model sentiment analysis:
        - TF-IDF + SVM
        - LSTM (Keras)
        - Transformer (DistilBERT via HuggingFace)
      - Modular backend architecture (NestJS + Prisma)
      - Interactive frontend (React + TypeScript)
      - Emoji-based feedback loop
      - Analytics logging for model usage and sentiment trends
      - Model selection toggle for comparative evaluation

    ## 🧱 Tech Stack

      | Layer      | Technologies Used                                      |
      |------------|--------------------------------------------------------|
      | Frontend   | React, TypeScript, Axios                               |
      | Backend    | NestJS, Prisma ORM, PostgreSQL                         |
      | ML Models  | scikit-learn, Keras, PyTorch, HuggingFace Transformers |
      | DevOps     | Docker, GitHub Actions (optional)                      |

    ## 📦 Installation
      ### Prerequisites
        - Node.js (v18+)
        - Python (v3.8+)
        - PostgreSQL
        - Docker (optional for containerization)
        - Must Download dataset sentiment140 from [Kaggle dataset](https://www.kaggle.com/datasets/kazanova/sentiment140) and place the csv file in backend/dataset/sentiment140.csv

      ### Backend Setup
        Setup Backend

      ### ML Model Server
        Setup server for machine learning model

    ## 📊 Analytics & Logging
      - Logs model usage frequency
      - Tracks sentiment distribution over time
      - Captures emoji feedback for UI/UX insights


    ## 🧠 Model Details

      | Model        | Description                                           |
      | ------------ | ----------------------------------------------------- | 
      | TF-IDF + SVM | Lightweight baseline using scikit-learn               | 
      | LSTM         | Sequential model trained on IMDB dataset              | 
      | Transformer  | Fine-tuned DistilBERT for robust sentiment detection  |

    ## 📁 Folder Structure

      sentimentAnalysis/
      ├── backend/         # NestJS API with Prisma
      ├── frontend/        # React UI
      ├── ml-models/       # Python ML services
      ├── prisma/          # DB schema and migrations
      └── README.md

    ## Future Enhancements
      - Add user authentication
      - Deploy via Docker Compose
      - Integrate real-time feedback loop for model retraining
      - Expand to multilingual sentiment analysis
  `
  },
  {
    icon: '📊',
    title: 'Logistic regression for predictions',
    description: 'The project is built and trained using logistic regression model using TensorFlow, PyTorch and Scikit-Learn library.',
    repo: 'https://github.com/aadishrath/MatchPredictor',
    details: `In this project, I built and trained logistic regression model using TensorFlow, PyTorch and Scikit-Learn library. This project has large league of legends dataset with 9 columns and 1000 rows. win is the target feature and kills, deaths, assists, gold-earned, cs, wards_placed, wards_killed, damage_dealt are input features.
            
    ## Introduction
      League of Legends, a popular multiplayer online battle arena (MOBA) game, generates extensive data from matches, providing an excellent opportunity to apply machine learning techniques to real-world scenarios. Performed the following steps to build a logistic regression model aimed at predicting the outcomes of League of Legends matches.

    ## Dataset
      Sample from the dataset:

      | win	| kills	| deaths | assists | gold_earned | cs	 | wards_placed | wards_killed | damage_dealt |
      | --- | ----- | ------ | ------- | ----------- | --- | ------------ | ------------ | ------------ |
      | 0	  |  16	  |    6	 |   19	   |    17088	   | 231 |      11	    |       7	     |     15367    |
      | 1	  |   8	  |    8	 |    5	   |    14865	   | 259 |      10	    | 	    2		   |     38332    |
      | 0	  |   0	  |   17   |   11	   |    15919	   | 169 |      14	    | 	    5		   |     24642    |
      | 0		|  19 	|   11	 |    1	   |    11534	   | 264 |      14		  | 	    3		   |     15789    |
      | 0		|  12 	|    7	 |    6    |    18926	   | 124 |      15		  | 	    7		   |     40268    |
      | 1		|  15	  |    7	 |    5	   |    19245	   | 70  |       9		  | 	    5		   |     25950    |
      | 0		|  12	  |   17	 |    2	   |     8156	   | 221 |      11		  | 	    7		   |     30563    |
      | 0		|  13	  |   19   |   12	   |    16580	   | 182 |      12		  | 	    0		   |     44649    |
      | 0		|   2	  |   14	 |    2	   |     9307	   | 136 |       3		  | 	    5		   |     41404    |


    ## Following steps are performed in the project
      - Step 1: Load the League of Legends dataset and preprocess it for training
      - Step 2: Implement a logistic regression model using PyTorch
      - Step 3: Train the logistic regression model on the dataset
      - Step 4: Implement optimization techniques and evaluate the model's performance
      - Step 5: Visualization and Interpretation
      - Step 6: Save and load the trained model
      - Step 7: Perform hyperparameter tuning to find the best learning rate
      - Step 8: Evaluate feature importance to understand the impact of each feature on the prediction


    #### This project was written as part of IBM's Intro to NN and PyTorch course found on [Coursera](https://www.coursera.org/learn/deep-neural-networks-with-pytorch/).
    `
  }
];

export const feProjects = [
  {
    icon: '🌐',
    title: 'Mock Banking App',
    link: 'https://adirathore7.github.io',
    description: 'A responsive and modern mock banking app built with React and Tailwind CSS to showcase React hooks and state management.',
    repo: 'https://github.com/adirathore7/adirathore7.github.io',
    details: `
    # Mock Banking App
    
    Welcome to the source code for my personal portfolio website, hosted at adirathore7.github.io. This site showcases my projects, skills, experience, and contact information in a clean, responsive layout.

    ## 🚀 Live Site

    🔗 [https://adirathore7.github.io](https://adirathore7.github.io/login)


    ## 🛠️ Tech Stack

    - **Frontend**: React, Vite, Tailwind CSS v4
    - **Deployment**: GitHub Pages

    ## 📦 Features

    - Fully responsive layout
    - Clean and modern UI
    - Smooth scrolling and animations
    - Project showcase section
    - Contact form or social links
    - Fast load times (static site)


    ## 📬 Contact

    - 🔗 [LinkedIn](https://www.linkedin.com/in/adirathore)  
    - 🧑‍💻 [GitHub](https://github.com/aadishrath)

    `
  },
  {
    icon: '🌐',
    title: 'Personal Portfolio Website',
    link: 'https://aadishrath.github.io',
    description: 'A responsive and modern personal portfolio website built with React and Tailwind CSS to showcase projects and skills.',
    repo: 'https://github.com/aadishrath/aadishrath.github.io',
    details: `
    # My Portfolio

    Welcome to my personal portfolio, built with **React**, **Vite**, and **Tailwind CSS v4**. This site showcases my work as a Machine Learning Engineer and Full-Stack Developer, with a focus on recruiter-facing polish, modular architecture, and real-world impact.

    ## 🚀 Live Site

    🔗 [aadishrath.github.io](https://aadishrath.github.io)

    ## 🧠 About Me

    I'm a Data Engineer with 6+ years of production frontend experience and a Master’s in Applied Science (Data Science). I specialize in NLP, Transformers, deploying ML pipelines using PyTorch, AWS and strong foundations in ETL pipelines, SQL. My portfolio highlights full-stack ML projects, scalable UI components, and end-to-end engineering.

    ## 🛠️ Tech Stack

    - **Frontend**: React, Vite, Tailwind CSS v4
    - **Deployment**: GitHub Pages

    ## 📦 Features

    - Responsive layout with Tailwind v4
    - SEO-optimized metadata and social preview images
    - Dynamic Languages & Tools grid with icon mapping
    - Modular data architecture for easy updates
    - Recruiter-focused presentation and branding

    ## 📬 Contact

    - 🔗 [LinkedIn](https://www.linkedin.com/in/adirathore)  
    - 🧑‍💻 [GitHub](https://github.com/aadishrath)

    `
  },
];
