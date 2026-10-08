export default function Skeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse flex justify-between gap-4">
      <div className="flex gap-3 flex-1">
        <div className="h-12 w-12 bg-gray-200 rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="h-9 w-20 bg-gray-200 rounded-lg" />
    </div>
  );
}