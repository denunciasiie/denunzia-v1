#!/usr/bin/env node

/**
 * SIIEC System Cleanup Script
 * 
 * This script performs a complete system reset:
 * 1. Deletes all test reports from the database
 * 2. Removes current RSA key pairs
 * 3. Prepares the system for production deployment
 * 
 * ⚠️ WARNING: This action is IRREVERSIBLE!
 * Use only when ready to deploy to production with new keys.
 */

import { query, closePool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function cleanup() {
    console.log(`\n${colors.bold}${colors.red}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}${colors.red}║     SIIEC SYSTEM CLEANUP - PRODUCTION RESET          ║${colors.reset}`);
    console.log(`${colors.bold}${colors.red}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.yellow}⚠️  WARNING: This script will:${colors.reset}`);
    console.log(`   ${colors.red}✗${colors.reset} Delete ALL reports from the database`);
    console.log(`   ${colors.red}✗${colors.reset} Remove current RSA key pairs (private_key.pem & public_key.pem)`);
    console.log(`   ${colors.red}✗${colors.reset} Reset audit logs`);
    console.log(`   ${colors.red}✗${colors.reset} Clear all test data\n`);

    const confirm1 = await ask(`${colors.yellow}Are you sure you want to continue? (yes/no): ${colors.reset}`);

    if (confirm1.toLowerCase() !== 'yes') {
        console.log(`\n${colors.cyan}✓ Cleanup cancelled. No changes made.${colors.reset}\n`);
        rl.close();
        process.exit(0);
    }

    const confirm2 = await ask(`\n${colors.red}${colors.bold}FINAL CONFIRMATION - Type 'DELETE ALL' to proceed: ${colors.reset}`);

    if (confirm2 !== 'DELETE ALL') {
        console.log(`\n${colors.cyan}✓ Cleanup cancelled. No changes made.${colors.reset}\n`);
        rl.close();
        process.exit(0);
    }

    console.log(`\n${colors.cyan}Starting cleanup process...${colors.reset}\n`);

    try {
        // Step 1: Delete all reports
        console.log(`${colors.cyan}[1/4] Deleting all reports...${colors.reset}`);
        const reportsResult = await query('DELETE FROM reports');
        console.log(`${colors.green}✓ Deleted ${reportsResult.rowCount} reports${colors.reset}`);

        // Step 2: Delete all audit logs
        console.log(`\n${colors.cyan}[2/4] Clearing audit logs...${colors.reset}`);
        const auditResult = await query('DELETE FROM audit_logs');
        console.log(`${colors.green}✓ Deleted ${auditResult.rowCount} audit log entries${colors.reset}`);

        // Step 3: Delete all evidence files records
        console.log(`\n${colors.cyan}[3/4] Clearing evidence file records...${colors.reset}`);
        const evidenceResult = await query('DELETE FROM evidence_files');
        console.log(`${colors.green}✓ Deleted ${evidenceResult.rowCount} evidence file records${colors.reset}`);

        // Step 4: Remove RSA keys
        console.log(`\n${colors.cyan}[4/4] Removing RSA key pairs...${colors.reset}`);
        const keysDir = path.join(__dirname, '../keys');
        const privateKeyPath = path.join(keysDir, 'private_key.pem');
        const publicKeyPath = path.join(keysDir, 'public_key.pem');

        let keysRemoved = 0;

        if (fs.existsSync(privateKeyPath)) {
            fs.unlinkSync(privateKeyPath);
            console.log(`${colors.green}✓ Removed private_key.pem${colors.reset}`);
            keysRemoved++;
        }

        if (fs.existsSync(publicKeyPath)) {
            fs.unlinkSync(publicKeyPath);
            console.log(`${colors.green}✓ Removed public_key.pem${colors.reset}`);
            keysRemoved++;
        }

        if (keysRemoved === 0) {
            console.log(`${colors.yellow}⚠ No key files found to remove${colors.reset}`);
        }

        // Summary
        console.log(`\n${colors.bold}${colors.green}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bold}${colors.green}║              CLEANUP COMPLETED SUCCESSFULLY           ║${colors.reset}`);
        console.log(`${colors.bold}${colors.green}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`);

        console.log(`${colors.cyan}Summary:${colors.reset}`);
        console.log(`  ${colors.green}✓${colors.reset} Reports deleted: ${reportsResult.rowCount}`);
        console.log(`  ${colors.green}✓${colors.reset} Audit logs cleared: ${auditResult.rowCount}`);
        console.log(`  ${colors.green}✓${colors.reset} Evidence files cleared: ${evidenceResult.rowCount}`);
        console.log(`  ${colors.green}✓${colors.reset} RSA keys removed: ${keysRemoved}`);

        console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
        console.log(`  1. Generate new production RSA keys: ${colors.cyan}npm run generate-keys${colors.reset}`);
        console.log(`  2. Update client-side public key in services/encryptionService.ts`);
        console.log(`  3. Restart the backend server`);
        console.log(`  4. Test the system with a new report\n`);

    } catch (error) {
        console.error(`\n${colors.red}✗ Error during cleanup:${colors.reset}`, error.message);
        process.exit(1);
    } finally {
        await closePool();
        rl.close();
    }
}

// Run cleanup
cleanup().catch(error => {
    console.error(`\n${colors.red}✗ Fatal error:${colors.reset}`, error);
    process.exit(1);
});
