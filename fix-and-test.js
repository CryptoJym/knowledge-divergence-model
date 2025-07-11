const { chromium } = require('playwright');

async function fixAndTest() {
  console.log('🔧 Testing fixes...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    if (msg.type() === 'log') console.log(`[LOG] ${msg.text()}`);
    if (msg.type() === 'error') console.error(`[ERROR] ${msg.text()}`);
  });
  
  try {
    await page.goto('file://' + process.cwd() + '/index.html', { 
      waitUntil: 'networkidle' 
    });
    
    // Skip welcome
    await page.evaluate(() => {
      document.getElementById('welcomeSection').classList.add('hidden');
      document.getElementById('mainTabs').classList.remove('hidden');
      document.getElementById('tourOverlay').style.display = 'none';
      document.getElementById('tourPopup').style.display = 'none';
    });
    
    // Test 1: AI Progress Slider
    console.log('🎚️ Testing AI Progress Slider...');
    await page.evaluate(() => showTab('see'));
    await page.waitForTimeout(1000);
    
    // Add debug logging to updateAISpeed
    await page.evaluate(() => {
      // Store original function
      const originalUpdateAISpeed = updateAISpeed;
      
      // Override with debug version
      window.updateAISpeed = function() {
        console.log('updateAISpeed called');
        const slider = document.getElementById('aiSpeedSlider');
        console.log('Slider value:', slider.value);
        
        // Call original
        originalUpdateAISpeed.call(this);
        
        // Log results
        console.log('After update:');
        console.log('Elite income:', document.getElementById('eliteIncome').textContent);
        console.log('Mass income:', document.getElementById('massIncome').textContent);
        console.log('Gap:', document.getElementById('incomeGapDisplay').textContent);
      };
    });
    
    // Get initial state
    const initialState = await page.evaluate(() => {
      return {
        eliteIncome: document.getElementById('eliteIncome').textContent,
        massIncome: document.getElementById('massIncome').textContent,
        gap: document.getElementById('incomeGapDisplay').textContent,
        sliderValue: document.getElementById('aiSpeedSlider').value
      };
    });
    console.log('Initial state:', initialState);
    
    // Move slider
    await page.evaluate(() => {
      const slider = document.getElementById('aiSpeedSlider');
      slider.value = 90;
      const event = new Event('input', { bubbles: true });
      slider.dispatchEvent(event);
    });
    
    await page.waitForTimeout(2000);
    
    // Get new state
    const newState = await page.evaluate(() => {
      return {
        eliteIncome: document.getElementById('eliteIncome').textContent,
        massIncome: document.getElementById('massIncome').textContent,
        gap: document.getElementById('incomeGapDisplay').textContent,
        sliderValue: document.getElementById('aiSpeedSlider').value
      };
    });
    console.log('New state:', newState);
    console.log('Values changed:', initialState.gap !== newState.gap ? '✅ YES' : '❌ NO');
    
    // Test 2: Future Scenarios
    console.log('\n🔮 Testing Future Scenarios...');
    await page.evaluate(() => showTab('future'));
    await page.waitForTimeout(1000);
    
    // Check if updateFutureScenario runs without errors
    const futureResult = await page.evaluate(() => {
      try {
        updateFutureScenario();
        return {
          success: true,
          gap: document.getElementById('futureGapValue').textContent,
          richIncome: document.getElementById('richIncome').textContent,
          poorIncome: document.getElementById('poorIncome').textContent
        };
      } catch (e) {
        return {
          success: false,
          error: e.message
        };
      }
    });
    
    console.log('Future Scenarios result:', futureResult);
    
    // Test 3: Check all visualizations
    console.log('\n📊 Checking all visualizations...');
    const vizCheck = await page.evaluate(() => {
      const results = {};
      
      // Check each tab's visualizations
      const tabs = ['see', 'why', 'future', 'reality'];
      
      tabs.forEach(tab => {
        showTab(tab);
        results[tab] = {};
        
        if (tab === 'see') {
          const mainViz = document.getElementById('mainVisualization');
          results[tab].mainViz = mainViz && mainViz.children.length > 0;
          const accelViz = document.getElementById('accelerationVisualization');
          results[tab].accelViz = accelViz && accelViz.children.length > 0;
        } else if (tab === 'why') {
          const factorsViz = document.getElementById('factorsVisualization');
          results[tab].factorsViz = factorsViz && factorsViz.children.length > 0;
        } else if (tab === 'future') {
          const futureViz = document.getElementById('futureVisualization');
          results[tab].futureViz = futureViz && futureViz.children.length > 0;
        } else if (tab === 'reality') {
          const realityChart = document.getElementById('realityChart');
          results[tab].realityChart = realityChart && realityChart.children.length > 0;
        }
      });
      
      return results;
    });
    
    console.log('Visualization check:', JSON.stringify(vizCheck, null, 2));
    
    // Test 4: Check for NaN values
    console.log('\n🔢 Checking for NaN values...');
    const nanCheck = await page.evaluate(() => {
      const elements = [
        'eliteIncome', 'massIncome', 'incomeGapDisplay',
        'futureGapValue', 'richIncome', 'poorIncome'
      ];
      
      const results = {};
      elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          results[id] = {
            text: el.textContent,
            hasNaN: el.textContent.includes('NaN')
          };
        }
      });
      
      return results;
    });
    
    console.log('NaN check:', JSON.stringify(nanCheck, null, 2));
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    console.log('\nKeeping browser open for inspection...');
    await page.waitForTimeout(300000); // 5 minutes
    await browser.close();
  }
}

fixAndTest();