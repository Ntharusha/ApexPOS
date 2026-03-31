/**
 * CeylonPOS Tax Engine
 * Sri Lanka Tax Compliance: VAT 18% + SSCL 2.5%
 *
 * References:
 *  - IRD Sri Lanka VAT Act (as of March 2024): 18% on standard rated supplies
 *  - SSCL (Social Security Contribution Levy) Act 2022: 2.5% on turnover
 *  - Threshold: VAT registration threshold LKR 120M/year (quarterly LKR 30M)
 */

const TAX_RATES = {
    VAT: 0.18,              // 18% VAT standard rate
    SSCL: 0.025,            // 2.5% SSCL
    SSCL_RETAIL_RATIO: 0.5, // On 50% of retail turnover (value-add approximation)
};

/**
 * Calculate taxes for a single sale
 * @param {Array} items - Array of { price, quantity, tax_category }
 * @param {number} discount - Total discount amount
 * @param {Object} settings - System settings (vatRate, ssclRate, etc.)
 * @param {string} businessType - 'RETAIL' | 'WHOLESALE' | 'HOSPITALITY' | 'PHARMACY'
 */
function calculateSaleTax(items, discount = 0, settings = null, businessType = 'RETAIL') {
    const activeSettings = {
        vatRate: settings?.vatRate ?? 0.18,
        ssclRate: settings?.ssclRate ?? 0.025,
        vatEnabled: settings?.vatEnabled ?? true,
        ssclEnabled: settings?.ssclEnabled ?? true,
        ssclRetailRatio: settings?.ssclRetailRatio ?? 0.5
    };

    let subtotal = 0;
    let vatAmount = 0;

    for (const item of items) {
        const lineTotal = Number(item.price) * Number(item.quantity);
        subtotal += lineTotal;

        const taxCategory = item.tax_category || 'STANDARD';

        if (taxCategory === 'STANDARD' && activeSettings.vatEnabled) {
            // Standard rated: apply VAT
            vatAmount += lineTotal * activeSettings.vatRate;
        }
        // ZERO_RATED => VAT = 0 (but reportable)
        // EXEMPT => completely outside VAT scope
    }

    // SSCL applies on turnover (after discount, before VAT)
    // For retail: approximate as 50% value-add ratio
    let ssclAmount = 0;
    let ssclBase = 0;
    if (activeSettings.ssclEnabled) {
        ssclBase = Math.max(0, subtotal - discount) * activeSettings.ssclRetailRatio;
        ssclAmount = ssclBase * activeSettings.ssclRate;
    }

    const grandTotal = Math.max(0, subtotal + vatAmount + ssclAmount - discount);

    return {
        subtotal: round(subtotal),
        discount: round(discount),
        vatAmount: round(vatAmount),
        ssclAmount: round(ssclAmount),
        grandTotal: round(grandTotal),
        taxDetails: {
            vatRate: activeSettings.vatRate * 100,
            ssclRate: activeSettings.ssclRate * 100,
            ssclBase: round(ssclBase),
            businessType,
            vatEnabled: activeSettings.vatEnabled,
            ssclEnabled: activeSettings.ssclEnabled
        }
    };
}


/**
 * Validate if a business is VAT registered (needs to file returns)
 * Threshold: LKR 120M/year or any quarter > LKR 30M
 */
function isVATRegistered(annualTurnover) {
    return annualTurnover >= 120_000_000;
}

/**
 * Format tax for IRDSL e-invoice (placeholder for E-invoicing spec)
 */
function formatForEInvoice(sale, businessInfo) {
    return {
        invoiceNumber: sale.saleId || sale._id,
        invoiceDate: new Date(sale.createdAt || Date.now()).toISOString(),
        supplierVatNo: businessInfo.vatNumber || '',
        supplierTin: businessInfo.tin || '',
        supplierName: businessInfo.name,
        items: sale.items.map(item => ({
            description: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            taxCategory: item.tax_category || 'STANDARD',
            lineTotal: item.price * item.quantity,
        })),
        taxSummary: {
            vatAmount: sale.vatAmount,
            ssclAmount: sale.ssclAmount,
            totalTax: (sale.vatAmount || 0) + (sale.ssclAmount || 0),
        },
        grandTotal: sale.grandTotal || sale.total,
    };
}

function round(val) {
    return Math.round(val * 100) / 100;
}

module.exports = {
    calculateSaleTax,
    isVATRegistered,
    formatForEInvoice,
    TAX_RATES,
};
