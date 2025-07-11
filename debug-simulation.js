const { chromium } = require('playwright');

async function debugSimulation() {
  console.log('🔬 Debugging simulation...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('file://' + process.cwd() + '/index.html', { 
      waitUntil: 'networkidle' 
    });
    
    // Skip welcome
    await page.evaluate(() => {
      document.getElementById('welcomeSection').classList.add('hidden');
      document.getElementById('mainTabs').classList.remove('hidden');
    });
    
    // Debug the simulation function
    const simResults = await page.evaluate(() => {
      const results = {};
      
      // Test with different g0 values
      const g0Values = [0.2, 0.4, 0.6, 0.8, 1.0];
      
      g0Values.forEach(g0 => {
        const sim = simulateKnowledge(6, { g0: g0 });
        results[`g0_${g0}`] = {
          g0: g0,
          initialKH: sim.KH[0],
          finalKH: sim.KH[sim.KH.length - 1],
          initialKL: sim.KL[0],
          finalKL: sim.KL[sim.KL.length - 1],
          initialGap: sim.gap[0],
          finalGap: sim.gap[sim.gap.length - 1]
        };
      });
      
      return results;
    });
    
    console.log('Simulation results for different g0 values:');
    Object.entries(simResults).forEach(([key, result]) => {
      console.log(`\n${key}:`);
      console.log(`  KH: ${result.initialKH.toFixed(3)} → ${result.finalKH.toFixed(3)}`);
      console.log(`  KL: ${result.initialKL.toFixed(3)} → ${result.finalKL.toFixed(3)}`);
      console.log(`  Gap: ${result.initialGap.toFixed(3)} → ${result.finalGap.toFixed(3)}`);
    });
    
    // Check the actual calculation in updateAISpeed
    console.log('\n🔍 Testing updateAISpeed calculations:');
    
    await page.evaluate(() => showTab('see'));
    await page.waitForTimeout(500);
    
    const sliderTests = [10, 50, 100];
    
    for (const value of sliderTests) {
      const result = await page.evaluate((val) => {
        // Set slider
        document.getElementById('aiSpeedSlider').value = val;
        
        // Calculate customG0
        const customG0 = 0.2 + (val / 100) * 0.8;
        
        // Run simulation
        const results = simulateKnowledge(6, { g0: customG0 });
        const baseSalary = 50000;
        const finalKH = results.KH[results.KH.length - 1] || 1;
        const finalKL = results.KL[results.KL.length - 1] || 1;
        
        // Calculate incomes with the same logic as updateAISpeed
        const eliteMultiplier = Math.min(Math.max(Math.pow(finalKH, 1.5), 1), 50);
        const massMultiplier = Math.min(Math.max(Math.pow(finalKL, 0.8), 0.8), 2);
        
        return {
          sliderValue: val,
          customG0: customG0,
          finalKH: finalKH,
          finalKL: finalKL,
          eliteMultiplier: eliteMultiplier,
          massMultiplier: massMultiplier,
          eliteIncome: baseSalary * eliteMultiplier,
          massIncome: baseSalary * massMultiplier,
          gap: (baseSalary * eliteMultiplier) / (baseSalary * massMultiplier)
        };
      }, value);
      
      console.log(`\nSlider = ${value}:`);
      console.log(`  customG0 = ${result.customG0.toFixed(2)}`);
      console.log(`  finalKH = ${result.finalKH.toFixed(3)}`);
      console.log(`  finalKL = ${result.finalKL.toFixed(3)}`);
      console.log(`  eliteMultiplier = ${result.eliteMultiplier.toFixed(2)}`);
      console.log(`  massMultiplier = ${result.massMultiplier.toFixed(2)}`);
      console.log(`  Elite income = $${result.eliteIncome.toLocaleString()}`);
      console.log(`  Mass income = $${result.massIncome.toLocaleString()}`);
      console.log(`  Gap = ${result.gap.toFixed(1)}x`);
    }
    
    // Check bounds in simulation
    console.log('\n🔍 Checking simulation bounds:');
    const boundsCheck = await page.evaluate(() => {
      const sim = simulateKnowledge(1, { g0: 1.0 });
      
      // Check if KH is hitting the upper bound
      const maxKH = Math.max(...sim.KH);
      const minKH = Math.min(...sim.KH);
      const maxKL = Math.max(...sim.KL);
      const minKL = Math.min(...sim.KL);
      
      return {
        KH_range: `${minKH.toFixed(3)} to ${maxKH.toFixed(3)}`,
        KL_range: `${minKL.toFixed(3)} to ${maxKL.toFixed(3)}`,
        KH_at_bound: maxKH >= 19.9,
        KL_at_bound: maxKL >= 4.9
      };
    });
    
    console.log('KH range:', boundsCheck.KH_range);
    console.log('KL range:', boundsCheck.KL_range);
    console.log('KH hitting upper bound:', boundsCheck.KH_at_bound ? '❌ YES' : '✅ NO');
    console.log('KL hitting upper bound:', boundsCheck.KL_at_bound ? '❌ YES' : '✅ NO');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    console.log('\n🔍 Keeping browser open...');
    await page.waitForTimeout(60000);
    await browser.close();
  }
}

debugSimulation();