export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-red-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin" />
      </div>
    </div>
  );
}
