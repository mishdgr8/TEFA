import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="modal-content size-guide-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Size Guide</h2>
              <button onClick={onClose} className="modal-close">
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="size-guide-container">
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>UK</th>
                      <th>US</th>
                      <th>EU</th>
                      <th>Bust (in)</th>
                      <th>Waist (in)</th>
                      <th>Hip (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>4</td>
                      <td>0</td>
                      <td>32</td>
                      <td>34</td>
                      <td>26</td>
                      <td>37</td>
                    </tr>
                    <tr>
                      <td>6</td>
                      <td>2</td>
                      <td>34</td>
                      <td>35</td>
                      <td>27</td>
                      <td>38</td>
                    </tr>
                    <tr>
                      <td>8</td>
                      <td>4</td>
                      <td>36</td>
                      <td>36</td>
                      <td>28</td>
                      <td>39</td>
                    </tr>
                    <tr>
                      <td>10</td>
                      <td>6</td>
                      <td>38</td>
                      <td>37</td>
                      <td>29</td>
                      <td>41</td>
                    </tr>
                    <tr>
                      <td>12</td>
                      <td>8</td>
                      <td>40</td>
                      <td>38</td>
                      <td>32</td>
                      <td>43</td>
                    </tr>
                    <tr>
                      <td>14</td>
                      <td>10</td>
                      <td>42</td>
                      <td>41</td>
                      <td>34</td>
                      <td>45</td>
                    </tr>
                    <tr>
                      <td>16</td>
                      <td>12</td>
                      <td>44</td>
                      <td>43</td>
                      <td>35</td>
                      <td>47</td>
                    </tr>
                    <tr>
                      <td>18</td>
                      <td>14</td>
                      <td>46</td>
                      <td>45</td>
                      <td>37</td>
                      <td>49</td>
                    </tr>
                    <tr>
                      <td>20</td>
                      <td>16</td>
                      <td>48</td>
                      <td>47</td>
                      <td>39</td>
                      <td>51</td>
                    </tr>
                    <tr>
                      <td>22</td>
                      <td>18</td>
                      <td>50</td>
                      <td>49</td>
                      <td>41</td>
                      <td>53</td>
                    </tr>
                  </tbody>
                </table>

                <div className="size-guide-notes">
                  <h3>Measuring Tips</h3>
                  <ul>
                    <li><strong>Bust:</strong> Measure around the fullest part of your chest.</li>
                    <li><strong>Waist:</strong> Measure around your natural waistline (narrowest part).</li>
                    <li><strong>Hips:</strong> Measure around the fullest part of your hips.</li>
                  </ul>
                  <p className="note">Note: Most of our pieces are designed for a relaxed, comfortable fit. If you're between sizes, we recommend sizing down for a more tailored look or staying with your size for the signature <span className="font-brand">TÉFA</span> flow.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <style>{`
            /* Base modal styles */
            .modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(4px);
              z-index: 100;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 16px;
            }

            .modal-content {
              position: relative;
              background: white;
              border-radius: var(--radius-xl);
              padding: var(--space-6);
              box-shadow: var(--shadow-xl);
              overflow-y: auto;
            }

            .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: var(--space-4);
            }

            .modal-header h2 {
              font-family: 'Cormorant Garamond', serif;
              font-size: 1.5rem;
              font-weight: 700;
              font-style: italic;
              color: var(--color-brown-dark);
            }

            .modal-close {
              background: none;
              border: none;
              color: var(--color-text-muted);
              cursor: pointer;
              padding: var(--space-1);
            }

            .modal-close:hover {
              color: var(--color-brown);
            }

            .size-guide-modal {
              max-width: 800px !important;
              width: 100%;
              max-height: calc(100vh - 32px);
            }

            .size-guide-container {
              padding: var(--space-2);
              overflow-x: auto;
            }

            @media (max-width: 600px) {
              .modal-overlay {
                padding: 12px;
              }

              .size-guide-modal {
                max-height: calc(100vh - 24px);
                padding: var(--space-4) !important;
              }

              .size-table {
                font-size: 0.8125rem;
                min-width: 500px;
              }

              .size-table th,
              .size-table td {
                padding: var(--space-2) var(--space-3);
              }

              .size-guide-notes {
                padding: var(--space-4);
              }

              .size-guide-notes h3 {
                font-size: 1.125rem;
              }
            }

            .size-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: var(--space-8);
              font-family: 'Quicksand', sans-serif;
            }

            .size-table th,
            .size-table td {
              text-align: left;
              padding: var(--space-4);
              border-bottom: 1px solid var(--color-nude-light);
            }

            .size-table th {
              font-weight: 700;
              color: var(--color-brown-dark);
              font-size: 0.875rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              background: var(--color-cream-dark);
            }

            .size-table td {
              font-size: 0.9375rem;
              color: var(--color-text);
            }

            .size-table tr:hover td {
              background: var(--color-cream);
            }

            .size-guide-notes {
              background: var(--color-cream-dark);
              padding: var(--space-6);
              border-radius: var(--radius-lg);
            }

            .size-guide-notes h3 {
              font-family: 'Cormorant Garamond', serif;
              font-size: 1.25rem;
              font-weight: 600;
              font-style: italic;
              margin-bottom: var(--space-4);
            }

            .size-guide-notes ul {
              list-style: none;
              padding: 0;
              margin: 0 0 var(--space-6) 0;
              display: flex;
              flex-direction: column;
              gap: var(--space-2);
            }

            .size-guide-notes li {
              font-size: 0.875rem;
              color: var(--color-text-light);
            }

            .size-guide-notes li strong {
              color: var(--color-brown-dark);
              width: 60px;
              display: inline-block;
            }

            .note {
              font-size: 0.8125rem;
              font-style: italic;
              color: var(--color-text-muted);
              line-height: 1.6;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
