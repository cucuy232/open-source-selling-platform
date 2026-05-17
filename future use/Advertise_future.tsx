import React from 'react';
import type { User, Listing } from '../types';

interface AdvertiseViewProps {
    currentUser: User | null;
    currentListings: Listing[];
    promoConfig: { itemId: number | null, days: number, reach: number };
    onPromoConfigChange: (config: { itemId: number | null, days: number, reach: number }) => void;
    onPostItemClick: () => void;
    onBackToHome: () => void;
}

const AdvertiseView: React.FC<AdvertiseViewProps> = ({
    currentUser,
    currentListings,
    promoConfig,
    onPromoConfigChange,
    onPostItemClick,
    onBackToHome
}) => {
    const hasNormalListing = currentListings.some(l => l.userId === currentUser?.id && !l.sponsored);

    return (
        <div className="chan-box">
            <div className="chan-box-header">Advertise on bhejiyo</div>
            <div className="chan-box-body">
                {!hasNormalListing && (
                    <div style={{ padding: '10px', background: '#fff5f5', border: '1px solid #d00', marginBottom: '15px', fontSize: '0.8rem', color: '#d00', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>Note:</strong> To be eligible for sponsored listings, you must first have at least one normal item posted on the marketplace.
                        </div>
                        <button
                            className="chan-button"
                            style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                            onClick={onPostItemClick}
                        >
                            [ Post Item ]
                        </button>
                    </div>
                )}
                <div style={{ marginTop: '20px' }}>
                    <h4 style={{ color: 'var(--text-red)', fontWeight: '800', letterSpacing: '0.5px' }}>[ WHY PROMOTE YOUR ITEMS? ]</h4>
                    <div style={{ marginTop: '15px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#117743', background: '#f0f0f0', padding: '15px', border: '1px solid #ccc' }}>
                        <div>&gt; be seller</div>
                        <div>&gt; have items to sell</div>
                        <div>&gt; click [Promote]</div>
                        <div>&gt; item gets pinned to top of home page instantly</div>
                        <div>&gt; thousands of buyers see your listing first</div>
                        <div>&gt; distinct gold border and 'Sponsored' badge grabs attention</div>
                        <div>&gt; receive 10x more enquiries than normal listings</div>
                    </div>
                </div>

                {hasNormalListing && (
                    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ffd700', background: '#fffef0' }}>
                        <h4 style={{ color: 'var(--text-red)', marginBottom: '10px', fontWeight: '800', letterSpacing: '0.5px' }}>[ YOUR ELIGIBLE ITEMS FOR PROMOTION ]</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                            {currentListings.filter(l => l.userId === currentUser?.id && !l.sponsored).map(item => {
                                const isSelected = promoConfig.itemId === item.id;
                                const costPer1000PerDay = 150;
                                const totalCost = promoConfig.days * (promoConfig.reach / 1000) * costPer1000PerDay;

                                return (
                                    <div key={item.id} style={{ border: isSelected ? '2px solid #d00' : '1px solid #ccc', padding: '10px', background: 'white', textAlign: 'center', transition: 'all 0.2s' }}>
                                        <img src={item.images[0]} alt={item.subject} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginTop: '8px', color: 'var(--text-red)' }}>{item.subject}</div>

                                        {!isSelected ? (
                                            <button
                                                className="chan-button"
                                                style={{ marginTop: '8px', fontSize: '0.7rem', width: '100%', background: '#ffd700', color: 'black' }}
                                                onClick={() => onPromoConfigChange({ ...promoConfig, itemId: item.id })}
                                            >
                                                [ Promote ]
                                            </button>
                                        ) : (
                                            <div style={{ marginTop: '10px', textAlign: 'left', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 'bold' }}>Duration (Days):</label>
                                                    <select
                                                        value={promoConfig.days}
                                                        onChange={(e) => onPromoConfigChange({ ...promoConfig, days: parseInt(e.target.value) })}
                                                        style={{ width: '100%', fontSize: '0.7rem', padding: '2px' }}
                                                    >
                                                        <option value={1}>1 Day</option>
                                                        <option value={3}>3 Days</option>
                                                        <option value={7}>7 Days (Recommended)</option>
                                                        <option value={14}>14 Days</option>
                                                    </select>
                                                </div>

                                                <div style={{ marginBottom: '8px' }}>
                                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 'bold' }}>Target Reach (Daily):</label>
                                                    <select
                                                        value={promoConfig.reach}
                                                        onChange={(e) => onPromoConfigChange({ ...promoConfig, reach: parseInt(e.target.value) })}
                                                        style={{ width: '100%', fontSize: '0.7rem', padding: '2px' }}
                                                    >
                                                        <option value={1000}>1,000 users</option>
                                                        <option value={5000}>5,000 users</option>
                                                        <option value={10000}>10,000 users</option>
                                                        <option value={50000}>50,000 users</option>
                                                    </select>
                                                    <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '2px', fontStyle: 'italic' }}>
                                                        * Your item will reach this many unique users every day for the selected duration.
                                                    </div>
                                                </div>

                                                <div style={{ padding: '8px', background: '#f8f8f8', border: '1px solid #ddd', marginBottom: '8px' }}>
                                                    <div style={{ fontSize: '0.65rem', color: '#666' }}>Total Estimated Cost:</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#117743' }}>₹{totalCost.toLocaleString()}</div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button
                                                        className="chan-button"
                                                        style={{ flex: 1, fontSize: '0.7rem', background: '#117743', color: 'white' }}
                                                        onClick={() => {
                                                            alert(`Payment of ₹${totalCost.toLocaleString()} initiated via BTC/XMR gateway!`);
                                                        }}
                                                    >
                                                        [ Pay & Start ]
                                                    </button>
                                                    <button
                                                        className="chan-button"
                                                        style={{ fontSize: '0.7rem' }}
                                                        onClick={() => onPromoConfigChange({ ...promoConfig, itemId: null })}
                                                    >
                                                        [ Cancel ]
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <button className="chan-button" style={{ marginTop: '20px' }} onClick={onBackToHome}>Back to Home</button>
            </div>
        </div>
    );
};

export default AdvertiseView;
