import { ArrowLeft, Cat, Image, MessageSquare, PawPrint, Scan, Search, User, Zap } from 'lucide-react';
import { useState } from 'react';

// --- Custom Color Constants based on the React Native snippet ---
const Colors = {
  primaryOrange: '#F7924A',
  lightOrange: '#FDEFE5',
  textPrimary: '#333333',
  textSecondary: '#888888',
  white: '#FFFFFF',
  borderColor: '#E0E0E0',
};

// --- Component Fragments ---

// Action Bar (Upload/Capture/Detected) - Styles updated to match new scheme
interface ActionBarProps {
  isDetected: boolean;
  onCaptureClick: () => void;
  onUploadClick: () => void;
}
const ActionBar = ({ isDetected, onCaptureClick, onUploadClick }: ActionBarProps) => (
  <div className="flex items-center justify-between px-10 py-4 w-full">
    
    {/* Upload Photo Button */}
    <div 
      className="flex flex-col items-center text-white cursor-pointer"
      onClick={onUploadClick}
    >
      <div className="p-3 bg-black/20 backdrop-blur-sm rounded-xl transition duration-150 active:scale-95">
        <Image size={24} />
      </div>
      <span className="text-sm mt-1 font-medium">Upload Photo</span>
    </div>

    {/* Main Capture Button */}
    <button 
      className="w-16 h-16 rounded-full border-4 border-white bg-white/30 backdrop-blur-sm shadow-xl transition duration-200 ease-in-out hover:bg-white/50 active:scale-90"
      onClick={onCaptureClick}
      aria-label="Capture Photo"
    >
      <div className="w-14 h-14 bg-white rounded-full mx-auto"></div>
    </button>
    
    {/* Detected Status */}
    <div className="flex flex-col items-center text-white cursor-default">
      <div className={`p-3 rounded-xl transition duration-150 ${isDetected ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-black/20 backdrop-blur-sm'}`}>
        <Cat size={24} />
      </div>
      <span className="text-sm mt-1 font-medium">{isDetected ? 'Detected: Cat' : 'Detecting...'}</span>
    </div>
  </div>
);

// Navigation Item - Styles updated to match new scheme
interface NavItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  isActive: boolean;
}
const NavItem = ({ icon: Icon, label, isActive }: NavItemProps) => (
  <div className={`flex flex-col items-center justify-center p-2 w-1/5 cursor-pointer transition-colors ${isActive ? 'text-[--primary-orange]' : 'text-[--text-secondary] hover:text-[--primary-orange]/80'}`}>
    <Icon size={26} className="mb-0.5" />
    <span className={`text-[10px] font-medium mt-1 ${isActive ? 'font-bold' : ''}`}>{label}</span>
  </div>
);


// Main Screen Component 
const App = () => {
  // State to simulate UI interaction
  const [isDetected] = useState(true);

  const handleCapture = () => {
    console.log('Capture Clicked - Triggering Camera...');
  };
  
  const handleUpload = () => {
    console.log('Upload Clicked - Opening File Picker...');
  };

  // Define CSS variables for custom colors
  const styleVariables = {
    '--primary-orange': Colors.primaryOrange,
    '--light-orange': Colors.lightOrange,
    '--text-primary': Colors.textPrimary,
    '--text-secondary': Colors.textSecondary,
    '--border-color': Colors.borderColor,
  };

  return (
    // Outer Container for web responsiveness
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans p-4" style={styleVariables as React.CSSProperties}>
      {/* Simulated Phone Screen Container for Context */}
      <div className="w-full max-w-sm h-[85vh] max-h-[900px] bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col transform transition-transform duration-300">
        
        {/* --- Header Section (White Background, Orange Logo) --- */}
        <div className="bg-white px-5 pt-6 pb-2 sticky top-0 z-50 shadow-sm border-b border-[--border-color]">
          <div className="flex items-center justify-between">
            {/* Left Icon (Placeholder for Back/Menu) */}
            <ArrowLeft size={24} className="text-[--text-primary] cursor-pointer" />
            
            {/* Logo Text - Styled like Furemedy in RN snippet */}
            <h1 className="text-3xl font-extrabold tracking-wide text-[--primary-orange]">Dermapaw</h1>
            
            {/* Right Icon (Placeholder for Profile) */}
            <User size={24} className="text-[--text-secondary] cursor-pointer" />
          </div>

          {/* --- Search Bar Section --- */}
          <div className="flex items-center bg-[--light-orange] rounded-full px-4 py-3 mt-4 mb-2">
            <Search size={20} className="text-[--text-secondary]" />
            <input
              type="text"
              placeholder="Search here"
              className="flex-1 ml-3 text-base bg-transparent outline-none placeholder-[--text-secondary]"
            />
          </div>
        </div>
        
        {/* Main Camera/Content View (flex-grow fills the space) */}
        {/* Changed background to dark for a better camera simulator experience */}
        <div className="flex-grow flex flex-col bg-gray-900 relative">
          
          {/* Flash Icon (Top Right) */}
          <div className="absolute top-4 right-4 p-2 bg-gray-700/50 hover:bg-gray-600/70 backdrop-blur-sm rounded-full cursor-pointer z-20 transition-colors">
            <Zap size={20} className="text-white" />
          </div>

          {/* Instructions Block (Center Top) */}
          <div className="p-6 text-center z-10">
            <h2 className="text-2xl font-bold text-white mb-2">Scan Pet Skin</h2>
            <p className="text-gray-300 text-sm">
              Place your pet's skin inside the frame. Please keep your device steady...
            </p>
          </div>

          {/* Camera View Area and Scanning Frame */}
          <div className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
            
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 opacity-90 z-0"></div>
            
            {/* Scanning Frame Overlay */}
            <div className="relative w-full h-full max-w-[80%] max-h-[80%]">
              {/* Corner Brackets: Using primary orange for highlight */}
              <div className="absolute top-0 left-0 w-1/4 h-1/4 border-t-8 border-l-8 border-[--primary-orange] rounded-tl-xl shadow-[0_0_15px_rgba(247,146,74,0.6)] z-10"></div>
              <div className="absolute top-0 right-0 w-1/4 h-1/4 border-t-8 border-r-8 border-[--primary-orange] rounded-tr-xl shadow-[0_0_15px_rgba(247,146,74,0.6)] z-10"></div>
              <div className="absolute bottom-0 left-0 w-1/4 h-1/4 border-b-8 border-l-8 border-[--primary-orange] rounded-bl-xl shadow-[0_0_15px_rgba(247,146,74,0.6)] z-10"></div>
              <div className="absolute bottom-0 right-0 w-1/4 h-1/4 border-b-8 border-r-8 border-[--primary-orange] rounded-br-xl shadow-[0_0_15px_rgba(247,146,74,0.6)] z-10"></div>

              {/* Central Pet Focus Image */}
              <img 
                src="https://placehold.co/200x300/e9a37c/333333?text=Pet+Focus" 
                alt="Pet being scanned" 
                className="absolute inset-0 m-auto max-h-[80%] w-auto object-cover rounded-xl shadow-2xl z-10 transition-transform duration-500 ease-in-out"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/200x300/e9a37c/333333?text=Pet+Focus";
                }}
              />

              {/* The Central Highlighted Scanner Icon */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 bg-[--primary-orange] rounded-full shadow-xl shadow-[--primary-orange]/50 z-20">
                <Scan size={20} className="text-white transform rotate-90" />
              </div>
            </div>
          </div>

          {/* Action Bar (Upload/Capture/Detection Status) */}
          <ActionBar 
            isDetected={isDetected} 
            onCaptureClick={handleCapture}
            onUploadClick={handleUpload}
          />
        </div>

        {/* --- Bottom Navigation Bar (Floating Scan Button) --- */}
        <div className="relative">
          <div 
            className="flex justify-around items-start h-20 bg-white border-t border-[--border-color] px-2 pt-3"
            // Ensure the spacer element is accounted for in the layout
          >
            {/* Left two buttons */}
            {/* PawPrint is set to Active state to match the RN HomeScreen example */}
            <NavItem icon={PawPrint} label="My Pets" isActive={true} /> 
            <NavItem icon={MessageSquare} label="Chatbot" isActive={false} />
            
            {/* Invisible Spacer (Takes up the center slot's width) */}
            <div className="w-1/5 h-full" aria-hidden="true"></div>

            {/* Right two buttons */}
            <NavItem icon={Search} label="Search" isActive={false} />
            <NavItem icon={User} label="Profile" isActive={false} />
          </div>

          {/* The floating scan button */}
          <button 
            className="absolute left-1/2 -top-8 w-16 h-16 rounded-full border-[6px] border-[--light-orange] bg-white flex items-center justify-center shadow-xl transform -translate-x-1/2 transition-all duration-300 hover:scale-[1.05]"
            onClick={() => console.log('Floating Scan Button Clicked')}
            aria-label="Start Scanner"
          >
            <Scan size={30} className="text-[--primary-orange] transform rotate-90" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;