import React from 'react';

export default function RedeemCreditModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Modal Container */}
            <div className="bg-white dark:bg-[#1c2633] w-full max-w-[520px] rounded-xl shadow-2xl overflow-hidden flex flex-col font-display">
                {/* Modal Header */}
                <div className="pt-8 pb-4 px-8 text-center">
                    <div className="inline-flex items-center justify-center size-14 rounded-full bg-[#4799eb]/10 mb-4">
                        <span className="material-symbols-outlined text-[#4799eb] text-3xl">redeem</span>
                    </div>
                    <h1 className="text-[#111418] dark:text-white text-2xl font-bold tracking-tight">Redeem Your Credit</h1>
                </div>
                {/* Modal Body */}
                <div className="px-8 pb-8">
                    <p className="text-[#637588] dark:text-gray-400 text-base font-normal leading-relaxed text-center mb-6">
                        You are about to use <strong>1 mock interview credit</strong> for a new session. This will grant you full evaluation access and personalized feedback for one full session.
                    </p>
                    {/* Balance Display */}
                    <div className="bg-[#f6f7f8] dark:bg-white/5 rounded-lg p-4 mb-6 border border-gray-100 dark:border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[#637588] dark:text-gray-400 text-sm">Current Balance</p>
                            <p className="text-[#111418] dark:text-white font-semibold text-sm">3 credits</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-[#637588] dark:text-gray-400 text-sm">Balance after</p>
                            <p className="text-[#4799eb] font-bold text-sm">2 credits</p>
                        </div>
                    </div>
                    {/* Session Choice */}
                    <div className="mb-8">
                        <h3 className="text-[#111418] dark:text-white text-sm font-bold uppercase tracking-wider mb-3">Select Interview Type</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Option 1 */}
                            <button className="flex flex-col items-start p-4 border-2 border-[#4799eb] bg-[#4799eb]/5 dark:bg-[#4799eb]/10 rounded-lg text-left transition-all">
                                <div className="flex justify-between w-full items-center mb-1">
                                    <span className="text-sm font-bold text-[#4799eb]">Short Mock</span>
                                    <span className="material-symbols-outlined text-[#4799eb] text-lg">radio_button_checked</span>
                                </div>
                                <p className="text-xs text-[#637588] dark:text-gray-400">15-20 mins • Quick practice session</p>
                            </button>
                            {/* Option 2 */}
                            <button className="flex flex-col items-start p-4 border border-gray-200 dark:border-white/10 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                <div className="flex justify-between w-full items-center mb-1">
                                    <span className="text-sm font-bold text-[#111418] dark:text-white">Long Mock</span>
                                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-lg">radio_button_unchecked</span>
                                </div>
                                <p className="text-xs text-[#637588] dark:text-gray-400">45-50 mins • Full job simulation</p>
                            </button>
                        </div>
                    </div>
                    {/* Footer Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg bg-gray-100 dark:bg-white/10 text-[#111418] dark:text-white font-semibold text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                        >
                            Cancel
                        </button>
                        <button className="flex-[2] px-4 py-3 rounded-lg bg-[#4799eb] text-white font-bold text-sm shadow-lg shadow-[#4799eb]/20 hover:bg-[#4799eb]/90 transition-all flex items-center justify-center gap-2">
                            Confirm & Start Interview
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                </div>
                {/* Promotion / Encouragement Footer */}
                <div className="bg-[#4799eb]/5 dark:bg-white/5 py-3 px-8 border-t border-gray-100 dark:border-white/5">
                    <p className="text-[11px] text-[#637588] dark:text-gray-400 text-center italic">
                        "Success is where preparation and opportunity meet. Let's nail this session!"
                    </p>
                </div>
            </div>
        </div>
    );
}
