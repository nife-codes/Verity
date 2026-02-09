import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

export default function ContradictionMap({ contradictions }) {
    const svgRef = useRef();
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        if (!contradictions || contradictions.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = svgRef.current.clientWidth;
        const height = Math.max(400, contradictions.length * 180);

        // Helper function to truncate text smartly (at word boundary)
        const smartTruncate = (text, maxLength) => {
            if (text.length <= maxLength) return text;
            const truncated = text.substring(0, maxLength);
            const lastSpace = truncated.lastIndexOf(' ');
            return (lastSpace > maxLength * 0.7 ? truncated.substring(0, lastSpace) : truncated) + '...';
        };

        const nodes = [];
        const links = [];

        contradictions.forEach((contradiction, i) => {
            const claimANode = {
                id: `${contradiction.id}-A`,
                fullStatement: contradiction.claim_a.statement,
                label: smartTruncate(contradiction.claim_a.statement, 60),
                source: contradiction.claim_a.source,
                credibility: contradiction.claim_a.credibility,
                type: 'claim_a',
                x: width * 0.2,
                y: 120 + i * 180,
            };

            const claimBNode = {
                id: `${contradiction.id}-B`,
                fullStatement: contradiction.claim_b.statement,
                label: smartTruncate(contradiction.claim_b.statement, 60),
                source: contradiction.claim_b.source,
                credibility: contradiction.claim_b.credibility,
                type: 'claim_b',
                x: width * 0.8,
                y: 120 + i * 180,
            };

            nodes.push(claimANode, claimBNode);

            links.push({
                source: claimANode,
                target: claimBNode,
                severity: contradiction.severity,
                confidence: contradiction.confidence,
            });
        });

        const g = svg.append('g');

        const getNodeColor = (credibility) => {
            if (credibility === 'very_high' || credibility === 'high') return '#10b981';
            if (credibility === 'medium') return '#f59e0b';
            return '#ef4444';
        };

        const getLinkColor = (severity) => {
            if (severity === 'critical') return '#dc2626';
            if (severity === 'high') return '#f97316';
            if (severity === 'medium') return '#f59e0b';
            return '#fbbf24';
        };

        // Draw links first (so they appear behind nodes)
        const link = g
            .selectAll('.link')
            .data(links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.source.x)
            .attr('y2', (d) => d.source.y)
            .attr('stroke', (d) => getLinkColor(d.severity))
            .attr('stroke-width', 3)
            .attr('stroke-dasharray', '8,4')
            .attr('opacity', 0);

        link
            .transition()
            .delay((d, i) => i * 800 + 500)
            .duration(1000)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y)
            .attr('opacity', 0.7);

        // Draw nodes
        const node = g
            .selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d) => `translate(${d.x},${d.y})`)
            .attr('opacity', 0);

        node
            .transition()
            .delay((d, i) => i * 400)
            .duration(600)
            .attr('opacity', 1);

        // Larger rectangles with better proportions
        node
            .append('rect')
            .attr('x', -140)
            .attr('y', -55)
            .attr('width', 280)
            .attr('height', 110)
            .attr('rx', 12)
            .attr('fill', (d) => getNodeColor(d.credibility))
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))');

        // Add text with proper wrapping and centering
        node.each(function (d) {
            const nodeGroup = d3.select(this);

            // Main statement (wrapped, centered)
            const words = d.label.split(' ');
            let line = '';
            let lineNumber = 0;
            const maxWidth = 250; // Leave padding
            const lineHeight = 16;
            const startY = -30;

            const tempText = nodeGroup.append('text')
                .attr('opacity', 0)
                .attr('font-size', '13px');

            words.forEach((word, i) => {
                const testLine = line + word + ' ';
                tempText.text(testLine);

                if (tempText.node().getComputedTextLength() > maxWidth && line !== '') {
                    // Add the current line
                    nodeGroup
                        .append('text')
                        .attr('text-anchor', 'middle')
                        .attr('x', 0)
                        .attr('y', startY + lineNumber * lineHeight)
                        .attr('fill', '#fff')
                        .attr('font-size', '13px')
                        .attr('font-weight', '600')
                        .text(line.trim());

                    line = word + ' ';
                    lineNumber++;
                } else {
                    line = testLine;
                }
            });

            // Add the last line
            if (line.trim() !== '') {
                nodeGroup
                    .append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', 0)
                    .attr('y', startY + lineNumber * lineHeight)
                    .attr('fill', '#fff')
                    .attr('font-size', '13px')
                    .attr('font-weight', '600')
                    .text(line.trim());
            }

            tempText.remove();

            // Source (centered)
            nodeGroup
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('x', 0)
                .attr('y', 20)
                .attr('fill', '#fff')
                .attr('font-size', '11px')
                .attr('opacity', 0.9)
                .text(d.source.length > 30 ? d.source.substring(0, 27) + '...' : d.source);

            // Credibility badge (centered)
            nodeGroup
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('x', 0)
                .attr('y', 38)
                .attr('fill', '#fff')
                .attr('font-size', '10px')
                .attr('font-weight', 'bold')
                .attr('opacity', 0.95)
                .text(d.credibility.toUpperCase());
        });

        setTimeout(() => setIsAnimating(false), nodes.length * 400 + 1500);
    }, [contradictions]);

    if (!contradictions || contradictions.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Contradiction Map</h2>
                {isAnimating && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="animate-pulse">●</div>
                        <span>Building visualization...</span>
                    </div>
                )}
            </div>
            <p className="text-sm text-slate-600 mb-4">
                Visual representation of contradicting claims across evidence sources
            </p>
            <svg
                ref={svgRef}
                className="w-full"
                style={{ height: `${Math.max(400, contradictions.length * 180)}px`, background: '#f8fafc', borderRadius: '8px' }}
            />
            <div className="mt-4 flex gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>High Credibility</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Medium Credibility</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Low Credibility</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-red-600"></div>
                    <span>Contradiction Link</span>
                </div>
            </div>
        </motion.div>
    );
}
