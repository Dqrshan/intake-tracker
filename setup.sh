cd backend
source venv/bin/activate
python ml.py &

cd frontend
npm run db:generate
npm run dev