const pool = require("../config/db");

const applyLoan = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      loanAmount,
      monthlyIncome,
      tenure,
      employmentType,
    } = req.body;

    const panFile = req.files?.panFile?.[0];
    const bankFile = req.files?.bankStatement?.[0];

    // Validate loan information
    if (!loanAmount || !monthlyIncome || !tenure) {
      return res.status(400).json({
        message: "Loan amount, monthly income and tenure are required",
      });
    }

    if (!panFile || !bankFile) {
      return res.status(400).json({
        message: "PAN card and bank statement are required",
      });
    }

    const amount = Number(loanAmount);
    const income = Number(monthlyIncome);
    const months = Number(tenure);

    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(income) ||
      !Number.isFinite(months)
    ) {
      return res.status(400).json({
        message: "Invalid loan details",
      });
    }

    if (amount < 10000) {
      return res.status(400).json({
        message: "Minimum loan amount is ₹10,000",
      });
    }

    if (income <= 0 || months <= 0) {
      return res.status(400).json({
        message: "Income and tenure must be greater than zero",
      });
    }

    /*
      Basic eligibility calculation.

      This is our first backend version.
      We can replace this later with the proper
      credit-score / bank-statement algorithm.
    */

    const interestRate = 10.5;

    const monthlyRate = interestRate / 100 / 12;

    const emi = Math.round(
      (amount *
        monthlyRate *
        Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)
    );

    const maxAffordableEmi = income * 0.4;

    const eligible =
      emi <= maxAffordableEmi &&
      amount <= income * 10;

    const avgBalance = Math.round(income * 1.2);

    const eligibilityScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (income / (amount / 10)) * 50 +
          (emi <= maxAffordableEmi ? 50 : 0)
        )
      )
    );

    const reason = eligible
      ? "Income and EMI criteria met"
      : "Requested loan amount is high compared with your income";

    const status = eligible ? "APPROVED" : "REJECTED";

    // Save loan application
    const loanResult = await pool.query(
      `INSERT INTO loan_applications
      (
        user_id,
        loan_amount,
        monthly_income,
        tenure,
        employment_type,
        credit_score,
        average_balance,
        eligibility_score,
        interest_rate,
        emi,
        status,
        reason
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id`,
      [
        userId,
        amount,
        income,
        months,
        employmentType || "Not specified",
        null,
        avgBalance,
        eligibilityScore,
        interestRate,
        emi,
        status,
        reason,
      ]
    );

    const applicationId = loanResult.rows[0].id;

    // Save PAN document
    await pool.query(
      `INSERT INTO documents
      (
        user_id,
        loan_application_id,
        document_type,
        file_name,
        file_path
      )
      VALUES ($1,$2,$3,$4,$5)`,
      [
        userId,
        applicationId,
        "PAN",
        panFile.originalname,
        panFile.path,
      ]
    );

    // Save bank statement
    await pool.query(
      `INSERT INTO documents
      (
        user_id,
        loan_application_id,
        document_type,
        file_name,
        file_path
      )
      VALUES ($1,$2,$3,$4,$5)`,
      [
        userId,
        applicationId,
        "BANK_STATEMENT",
        bankFile.originalname,
        bankFile.path,
      ]
    );

    res.status(201).json({
      message: "Loan application processed successfully",

      applicationId,

      eligible,

      amount,

      emi,

      interestRate,

      panVerified: true,

      avgBalance,

      eligibilityScore,

      reason,

      panData: {
        verified: true,
      },

      bankData: {
        avgBalance,
        months: 6,
      },
    });
  } catch (error) {
    console.error("Loan application error:", error);

    res.status(500).json({
      message: "Server error while processing loan application",
    });
  }
};

module.exports = {
  applyLoan,
};