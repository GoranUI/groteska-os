# Time Tracker Testing Guide

## How to Test the Time Tracker

### 1. Basic Functionality Tests

#### Adding Time Entries:
1. **Via Form**: Click "Add Manually" button in the timer widget (right sidebar)
2. **Via Drag**: In day view, click and drag on the timeline to create a time block
3. **Via Timer**: Use the start/stop timer functionality

#### Viewing Time Entries:
1. **Day View**: Switch to day view to see detailed timeline
2. **Week View**: See weekly aggregation by project
3. **Month View**: See monthly summaries by week

### 2. What to Check When Testing

#### Data Visibility:
- ✅ New entries appear immediately after creation
- ✅ Time entries show correct project/task names
- ✅ Duration calculations are accurate
- ✅ Entries appear in correct date ranges

#### UI Behavior:
- ✅ Timeline shows entries as colored blocks
- ✅ Time labels (00:00, 01:00, etc.) are properly aligned
- ✅ No visual glitches or overlapping elements
- ✅ Responsive design works on different screen sizes

#### State Management:
- ✅ Adding an entry refreshes all views (timeline, list, summary cards)
- ✅ Switching between day/week/month views maintains data
- ✅ Date selection updates all components consistently

### 3. Common Issues to Look For

#### Data Not Showing:
- Check console for fetch errors
- Verify date ranges match (UTC vs local time)
- Confirm RLS policies allow data access
- Look for state synchronization issues

#### Performance Issues:
- Excessive re-renders (check React DevTools)
- Slow data fetching
- Memory leaks from event listeners

#### UI Problems:
- Timeline elements overlapping
- Incorrect time positioning
- Missing or misaligned labels

### 4. Debug Tools Available

#### Built-in Debuggers:
- **Time Entry Debugger**: Shows state changes and events (bottom-left)
- **State Inspector**: Shows current data and filters (bottom-right)
- **Console Logs**: Detailed fetch and state information

#### Browser DevTools:
- **React DevTools**: Component state and props
- **Network Tab**: API requests and responses
- **Console**: Error messages and debug logs

### 5. Manual Test Scenarios

#### Scenario 1: Create and View Entry
1. Go to Time Report page
2. Switch to Day view
3. Add a manual entry for today
4. Verify it appears in timeline and entry list
5. Check summary cards update

#### Scenario 2: Cross-Date Testing
1. Add entry for yesterday
2. Switch to different date
3. Verify entry appears/disappears correctly
4. Test week and month views

#### Scenario 3: Multiple Projects
1. Create entries for different projects
2. Verify color coding works
3. Check aggregations in week/month views
4. Test filtering and grouping

### 6. Database Verification

Use these SQL queries to verify data:

```sql
-- Check recent entries
SELECT * FROM time_entries 
WHERE user_id = '[YOUR_USER_ID]' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check entries for specific date range
SELECT * FROM time_entries 
WHERE user_id = '[YOUR_USER_ID]' 
AND start_time >= '2025-07-03T00:00:00.000Z' 
AND start_time <= '2025-07-03T23:59:59.999Z';
```

### 7. Quick Fixes for Common Issues

#### No Data Showing:
1. Check RLS policies
2. Verify user authentication
3. Clear browser cache
4. Check network connectivity

#### Timeline Not Updating:
1. Refresh the page
2. Check console for errors
3. Verify event listeners are attached
4. Look for state sync issues

#### Performance Issues:
1. Reduce debug logging
2. Check for infinite re-renders
3. Optimize component memoization
4. Monitor memory usage