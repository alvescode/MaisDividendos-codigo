package com.maisdividendos.stock_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.maisdividendos.stock_api.entities.StockBrapiInfo;
import java.util.Optional;

@Repository
public interface BrapiRepository extends JpaRepository<StockBrapiInfo, Long> {
    Optional<StockBrapiInfo> findBySymbol(String ticker);
}
