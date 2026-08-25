# Synthetic Seed Creation Equations

**Field Note / 001**  
*Begin with a question.*  
*The map changes as you follow it.*

These equations integrate the physical formation of the capsule (spherification), the biological embryo it protects, and the environmental field conditions that determine whether it becomes a viable plant.

---

## 1. Core Question → Geometry of the Seed

What radius and volume must the capsule have so the somatic embryo remains viable while the outer shell sets?

For a spherical synthetic seed formed by alginate spherification:

$$
V = \frac{4}{3}\pi r^{3}
$$

$$
A = 4\pi r^{2}
$$

where  
- \( r \) = outer radius of the finished bead (typically 2–5 mm for most protocols)  
- \( V \) = internal volume available to the embryo + matrix  
- \( A \) = surface area controlling gas and water exchange  

The droplet volume before gelling is set by the nozzle or pipette:

$$
V_{\text{drop}} = \frac{4}{3}\pi r_{\text{drop}}^{3} \approx Q \cdot t
$$

(\( Q \) = volumetric flow rate of the alginate–embryo suspension, \( t \) = formation time).

---

## 2. Spherification Kinetics (Gelation Front)

Calcium ions diffuse inward, converting liquid alginate into a hydrogel shell.

The position of the gelation front \( x(t) \) roughly follows a diffusion-limited relation:

$$
x(t) \approx \sqrt{2 D_{\text{Ca}} \cdot C_{\text{Ca}} \cdot t / C_{\text{alg}}}
$$

or, more simply for thin shells:

$$
\delta_{\text{shell}}(t) = k \sqrt{t}
$$

where  
- \( D_{\text{Ca}} \) = effective diffusion coefficient of Ca²⁺ in the alginate matrix  
- \( C_{\text{Ca}} \) = concentration in the gelling bath  
- \( C_{\text{alg}} \) = alginate concentration  
- \( k \) = empirical rate constant  

Shell thickness \(\delta\) must be thick enough for mechanical strength yet thin enough for oxygen and water exchange.

---

## 3. Embryo Viability & Growth Inside the Capsule

A minimal logistic growth model for embryo biomass \( B \) (or developmental stage):

$$
\frac{dB}{dt} = \mu B \left(1 - \frac{B}{B_{\max}}\right) - m B
$$

- \(\mu\) = specific growth rate (function of nutrients, hormones, temperature)  
- \( B_{\max} \) = carrying capacity set by capsule volume \( V \)  
- \( m \) = maintenance / stress coefficient (rises if oxygen or humidity falls)  

Oxygen supply through the shell can be approximated by diffusion:

$$
J_{\text{O}_2} = \frac{D_{\text{O}_2} \cdot A \cdot (C_{\text{ext}} - C_{\text{int}})}{\delta_{\text{shell}}}
$$

If \( J_{\text{O}_2} \) drops below the embryo’s respiratory demand, \( m \) increases and viability collapses.

---

## 4. Environmental Field Terms (Air Density, Flow, Wetness)

These couple the laboratory or growth-chamber conditions to the seed.

**Humidity / water potential balance** (prevents desiccation or hyperhydration):

$$
\frac{dW}{dt} = A \cdot k_w \cdot (a_w^{\text{air}} - a_w^{\text{seed}})
$$

- \( W \) = water content of the capsule  
- \( a_w \) = water activity  
- \( k_w \) = mass-transfer coefficient (strongly dependent on air flow velocity)  

**Air flow and density influence** on the boundary layer:

$$
k_w \propto \frac{\rho_{\text{air}}^{0.5} \cdot u^{0.5}}{\mu_{\text{air}}^{0.5}}
$$

(approximate Reynolds-number dependence; \(\rho\) = air density, \( u \) = free-stream velocity, \(\mu\) = viscosity).

Higher laminar flow (as in a sterile hood) thins the boundary layer, raising exchange rates, but excessive velocity can dry the surface.

---

## 5. Trait / Offspring Mapping (Symbolic Closure)

If each successful germination transmits a trait vector \(\mathbf{T}\), a simple generational map is:

$$
\mathbf{T}_{n+1} = f(\mathbf{T}_n, E) + \boldsymbol{\varepsilon}
$$

where \( E \) is the environmental field (humidity, oxygen, temperature, light) experienced by the synthetic seed, and \(\boldsymbol{\varepsilon}\) is residual variation (somaclonal or intentional).

The field note’s line “The map changes as you follow it” is expressed by making \( f \) itself depend on the path taken through environmental space.

---

## Compact System (Seed Creation ODEs)

A minimal coupled set you can integrate numerically:

$$
\begin{align*}
\frac{dr}{dt} &= 0 && \text{(fixed after gelation)} \\
\frac{d\delta}{dt} &= \frac{k}{2\sqrt{t}} && \text{(shell thickening)} \\
\frac{dB}{dt} &= \mu(E) B \left(1 - \frac{B}{c V}\right) - m(E) B \\
\frac{dW}{dt} &= A k_w(u,\rho) (a_w^{\text{air}} - a_w^{\text{seed}})
\end{align*}
$$

with \( E = E(\text{air density, flow, humidity, sterile status}) \).

---

*These equations turn the poetic leaf-and-rune image into quantitative relations: the glowing leaf becomes the living embryo, the runes the encoded traits, the circular field the controlled sterile environment, and the invitation “Begin with a question” the starting point for choosing \( r \), \(\delta\), \(\mu\), and the environmental set-points.*
