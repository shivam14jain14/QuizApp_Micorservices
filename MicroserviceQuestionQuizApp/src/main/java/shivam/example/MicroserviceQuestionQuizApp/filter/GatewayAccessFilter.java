package shivam.example.MicroserviceQuestionQuizApp.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GatewayAccessFilter extends OncePerRequestFilter {
    private static final String GATEWAY_HEADER_NAME = "X-Internal-Gateway";
    private static final String GATEWAY_HEADER_VALUE = "UserAPIGateway";
    private static final String ERROR_MESSAGE =
            "Incorrect path or URL not found. Please access the service through API Gateway port 8765.";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        if (isProtectedPath(path) && !GATEWAY_HEADER_VALUE.equals(request.getHeader(GATEWAY_HEADER_NAME))) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.setContentType("text/plain");
            response.getWriter().write(ERROR_MESSAGE);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isProtectedPath(String path) {
        return !path.startsWith("/actuator");
    }
}
