import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Settings } from "lucide-react";

interface MaintenanceModalProps {
  isOpen: boolean;
  onAccessGranted: () => void;
}

const MAINTENANCE_PASSCODE = "180909";
const STORAGE_KEY = "healios_maintenance_access";

export function MaintenanceModal({ isOpen, onAccessGranted }: MaintenanceModalProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if access was already granted in this session
    const hasAccess = localStorage.getItem(STORAGE_KEY) === "granted";
    if (hasAccess) {
      onAccessGranted();
    }
  }, [onAccessGranted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate a brief loading state
    setTimeout(() => {
      if (passcode === MAINTENANCE_PASSCODE) {
        localStorage.setItem(STORAGE_KEY, "granted");
        onAccessGranted();
      } else {
        setError("Invalid passcode. Please try again.");
        setPasscode("");
      }
      setIsLoading(false);
    }, 800);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black rounded-lg shadow-2xl max-w-md w-full p-8 border border-white">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-white animate-spin" style={{ animation: 'spin 3s linear infinite' }} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Planned Maintenance
          </h2>
          <p className="text-white/80 leading-relaxed">
            We're currently performing scheduled maintenance to improve your experience. 
            The site will be back online shortly.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-white/60">
            <AlertCircle className="w-4 h-4" />
            <span>Estimated completion: 2-4 hours</span>
          </div>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="passcode" className="block text-sm font-medium text-white mb-2">
              Access Code
            </label>
            <Input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter access code"
              className="w-full text-center tracking-widest bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white"
              data-testid="input-maintenance-passcode"
              maxLength={6}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/20 border border-red-300/30 p-3 rounded-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={!passcode || isLoading}
            className="w-full bg-white text-black hover:bg-white/90 disabled:bg-white/50"
            data-testid="button-maintenance-access"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Access Site"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-xs text-white/60 text-center">
            For urgent matters, please contact support at{" "}
            <a href="mailto:support@healios.com" className="text-white hover:underline">
              support@healios.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}