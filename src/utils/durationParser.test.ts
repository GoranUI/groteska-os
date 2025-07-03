// Simple test for duration parsing logic
// This can be run in the browser console to test the parsing

export function testDurationParsing() {
  const parseDuration = (durationStr: string): number => {
    // Trim whitespace and convert to lowercase
    const cleanStr = durationStr.trim().toLowerCase();
    
    // More flexible regex that handles various formats
    const regex = /^(\d+)\s*h(?:ours?)?\s*(\d+)\s*m(?:inutes?)?$|^(\d+)\s*h(?:ours?)?$|^(\d+)\s*m(?:inutes?)?$/;
    const match = cleanStr.match(regex);
    
    if (!match) {
      console.log('Duration parsing failed for:', durationStr);
      return 0;
    }
    
    let hours = 0;
    let minutes = 0;
    
    if (match[1] && match[2]) {
      // Format: "2h30m" or "2 hours 30 minutes"
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
    } else if (match[3]) {
      // Format: "2h" or "2 hours"
      hours = parseInt(match[3], 10);
    } else if (match[4]) {
      // Format: "30m" or "30 minutes"
      minutes = parseInt(match[4], 10);
    }
    
    const totalSeconds = hours * 3600 + minutes * 60;
    return totalSeconds;
  };

  const testCases = [
    '2h30m',
    '2h',
    '30m',
    '1h45m',
    '2 hours 30 minutes',
    '1 hour',
    '45 minutes',
    '2h 30m',
    '1h 45m'
  ];

  console.log('Testing duration parsing:');
  testCases.forEach(testCase => {
    const result = parseDuration(testCase);
    console.log(`${testCase} -> ${result} seconds (${Math.floor(result/3600)}h ${Math.floor((result%3600)/60)}m)`);
  });
}

// Run this in browser console: testDurationParsing() 