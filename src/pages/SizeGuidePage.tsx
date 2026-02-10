import React from 'react';

export const SizeGuidePage: React.FC = () => {
    return (
        <div className="support-page size-page">
            <div className="container">
                <div className="support-header">
                    <h1>Size Guide</h1>
                    <p>Find your perfect <span className="font-brand">TÉFA</span> fit with our detailed body charts.</p>
                </div>

                <div className="size-guide-content">
                    <div className="size-table-container">
                        <table className="size-table">
                            <thead>
                                <tr>
                                    <th>Label Size</th>
                                    <th>Bust (in)</th>
                                    <th>Waist (in)</th>
                                    <th>Hip (in)</th>
                                    <th>Height</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>XS</td><td>32 - 33.5</td><td>24 - 25.5</td><td>34 - 35.5</td><td>5'3" - 5'5"</td></tr>
                                <tr><td>S</td><td>33.9 - 35.5</td><td>26 - 27.6</td><td>35.9 - 37.4</td><td>5'5" - 5'7"</td></tr>
                                <tr><td>M</td><td>35.5 - 37.4</td><td>27.6 - 29.2</td><td>37.4 - 39</td><td>5'7" - 5'9"</td></tr>
                                <tr><td>L</td><td>37.4 - 39.4</td><td>29.2 - 31.9</td><td>39.4 - 41.8</td><td>5'9" - 5'11"</td></tr>
                                <tr><td>XL</td><td>39.4 - 41.8</td><td>31.9 - 34.3</td><td>41.8 - 44.1</td><td>5'9" - 5'11"</td></tr>
                                <tr><td>XXL</td><td>41.8 - 44.1</td><td>34.3 - 36.7</td><td>44.1 - 46.5</td><td>5'11" - 6'1"</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="how-to-measure">
                        <h2>How to Measure</h2>
                        <div className="measure-grid">
                            <div className="measure-item">
                                <h3>1. Bust</h3>
                                <p>Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                            </div>
                            <div className="measure-item">
                                <h3>2. Waist</h3>
                                <p>Measure around your natural waistline (the narrowest part), keeping the tape loose.</p>
                            </div>
                            <div className="measure-item">
                                <h3>3. Hips</h3>
                                <p>Measure around the fullest part of your hips, approximately 20cm below your waistline.</p>
                            </div>
                        </div>
                    </div>

                    <div className="fit-notes">
                        <h3>Our Signature Fit</h3>
                        <p>
                            Most of our pieces are designed for a relaxed, comfortable fit. The "flow" of the fabric is central to our design philosophy.
                        </p>
                        <p>
                            If you're between sizes, we recommend sizing down for a more tailored look or staying with your size for the signature <span className="font-brand">TÉFA</span> flow.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .support-page {
                    padding-top: 160px;
                    padding-bottom: var(--space-24);
                    background-color: var(--color-cream);
                }

                .support-header {
                    text-align: center;
                    margin-bottom: var(--space-16);
                }

                .size-guide-content {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .size-table-container {
                    background: white;
                    padding: var(--space-8);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                    overflow-x: auto;
                    margin-bottom: var(--space-16);
                }

                .size-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .size-table th,
                .size-table td {
                    padding: var(--space-4);
                    text-align: left;
                    border-bottom: 1px solid var(--color-nude-light);
                }

                .size-table th {
                    font-weight: 700;
                    color: var(--color-brown-dark);
                    background: var(--color-nude-light);
                    text-transform: uppercase;
                    font-size: 0.8125rem;
                }

                .how-to-measure {
                    margin-bottom: var(--space-16);
                }

                .how-to-measure h2 {
                    font-size: 2rem;
                    margin-bottom: var(--space-8);
                    text-align: center;
                }

                .measure-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: var(--space-8);
                }

                .measure-item h3 {
                    margin-bottom: var(--space-2);
                    color: var(--color-coral);
                }

                .measure-item p {
                    font-size: 0.9375rem;
                    color: var(--color-text-muted);
                    line-height: 1.6;
                }

                .fit-notes {
                    background: var(--color-brown-dark);
                    color: white;
                    padding: var(--space-12);
                    border-radius: var(--radius-xl);
                    text-align: center;
                }

                .fit-notes h3 {
                    color: white;
                    font-size: 1.75rem;
                    margin-bottom: var(--space-4);
                }

                .fit-notes p {
                    max-width: 600px;
                    margin: 0 auto var(--space-4);
                    opacity: 0.9;
                    line-height: 1.8;
                }
            `}</style>
        </div>
    );
};
