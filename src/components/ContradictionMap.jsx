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
        const height = 400;

        const nodes = [];
        const links = [];

        contradictions.forEach((contradiction, i) => {
            const claimANode = {
                id: `${contradiction.id}-A`,
                label: contradiction.claim_a.statement.substring(0, 40) + '...',
                source: contradiction.claim_a.source,
                credibility: contradiction.claim_a.credibility,
                type: 'claim_a',
                x: width * 0.25,
                y: 100 + i * 150,
            };

            const claimBNode = {
                id: `${contradiction.id}-B`,
                label: contradiction.claim_b.statement.substring(0, 40) + '...',
                source: contradiction.claim_b.source,
                credibility: contradiction.claim_b.credibility,
                type: 'claim_b',
                x: width * 0.75,
                y: 100 + i * 150,
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
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0);

        link
            .transition()
            .delay((d, i) => i * 800 + 500)
            .duration(1000)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y)
            .attr('opacity', 0.8);

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

        node
            .append('circle')
            .attr('r', 50)
            .attr('fill', (d) => getNodeColor(d.credibility))
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))');

        node
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', -10)
            .attr('fill', '#fff')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .text((d) => d.label);

        node
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 10)
            .attr('fill', '#fff')
            .attr('font-size', '9px')
            .text((d) => d.source);

        node
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 25)
            .attr('fill', '#fff')
            .attr('font-size', '8px')
            .attr('opacity', 0.8)
            .text((d) => d.credibility.toUpperCase());

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
                style={{ height: '400px', background: '#f8fafc', borderRadius: '8px' }}
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
