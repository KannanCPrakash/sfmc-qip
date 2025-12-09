export function ImpactList() {
  return (
    <div className="p-4">
      <p className="text-sm font-medium text-gray-700">
        Impact: Breaks <span className="text-red-600 font-bold">8 Data Extensions</span>
      </p>
      <ul className="mt-2 text-sm text-gray-600 space-y-1">
        <li>• Daily_SMS_Send</li>
        <li>• Weekly_Recap</li>
        <li>• Abandoned_Cart_Flow</li>
      </ul>
    </div>
  );
}